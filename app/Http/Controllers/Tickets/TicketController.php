<?php

namespace App\Http\Controllers\Tickets;

use App\Http\Controllers\Controller;
use App\Models\CompanyAddOn;
use App\Models\Module;
use App\Models\Ticket;
use App\Models\TicketProposal;
use App\Models\TicketStatusHistory;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TicketController extends Controller
{
    // -------------------------------------------------------------------------
    // INDEX
    // -------------------------------------------------------------------------

    public function index(Request $request)
    {
        $user = $request->user();

        $tickets = Ticket::query()
            ->with(['company', 'assignee'])
            ->when(!$user->isSuperAdmin(), fn($q) => $q->where('company_id', $user->company->id))
            ->when($request->search, fn($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('code', 'like', "%{$s}%")
                  ->orWhere('title', 'like', "%{$s}%");
            }))
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->when($request->type,   fn($q, $t) => $q->where('type', $t))
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        $tickets->getCollection()->transform(fn($t) => $this->transformTicket($t));

        return Inertia::render('tickets/index', [
            'tickets'    => $tickets,
            'filters'    => $request->only(['search', 'status', 'type']),
            'pageConfig' => [
                'title'       => 'Ticket Management',
                'description' => 'Manage feature requests and bug reports.',
                'can_manage'  => $user->isSuperAdmin(),
            ],
        ]);
    }

    // -------------------------------------------------------------------------
    // CREATE (form)
    // -------------------------------------------------------------------------

    public function create(Request $request)
    {
        $user    = $request->user();
        $company = $user->company;

        // Only non-free-plan companies can create feature requests
        $hasActivePlan = $company->activeSubscription()->exists();

        return Inertia::render('tickets/create', [
            'hasActivePlan' => $hasActivePlan,
            'pageConfig'    => [
                'title'       => 'Create Ticket',
                'description' => 'Submit a feature request or bug report.',
                'can_manage'  => false,
            ],
        ]);
    }

    // -------------------------------------------------------------------------
    // STORE
    // -------------------------------------------------------------------------

    public function store(Request $request)
    {
        $user    = $request->user();
        $company = $user->company;

        $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'type'        => 'required|in:feature_request,bug_report',
            'priority'    => 'required|in:low,medium,high,critical',
        ]);

        // Feature requests require an active plan
        if ($request->type === 'feature_request' && !$company->activeSubscription()->exists()) {
            return back()->with('error', 'You need an active plan (non-free) to submit feature requests.');
        }

        $ticket = Ticket::create([
            'code'        => 'TKT/' . now()->format('Ymd') . '/' . strtoupper(Str::random(5)),
            'company_id'  => $company->id,
            'title'       => $request->title,
            'description' => $request->description,
            'type'        => $request->type,
            'priority'    => $request->priority,
            'status'      => 'open',
            'created_by'  => $user->id,
        ]);

        TicketStatusHistory::create([
            'ticket_id'   => $ticket->id,
            'from_status' => null,
            'to_status'   => 'open',
            'changed_by'  => $user->id,
            'note'        => 'Ticket created.',
        ]);

        return redirect()->route('tickets.show', $ticket)
            ->with('success', 'Ticket submitted successfully.');
    }

    // -------------------------------------------------------------------------
    // SHOW
    // -------------------------------------------------------------------------

    public function show(Request $request, Ticket $ticket)
    {
        $user = $request->user();

        // Company user can only see their own tickets
        if (!$user->isSuperAdmin()) {
            abort_if($ticket->company_id !== $user->company->id, 403);
        }

        $ticket->load([
            'company',
            'assignee',
            'messages.user',
            'comments.user',
            'histories.changedBy',
            'proposal.invoiceAddOn',
        ]);

        // Kirim daftar addon modules hanya untuk admin (untuk form proposal)
        $addonModules = $user->isSuperAdmin()
            ? Module::where('type', Module::TYPE_ADDON)
                ->where('is_active', true)
                ->get()
                ->map(fn($m) => [
                    'id'        => $m->id,
                    'name'      => $m->name,
                    'price'     => (float) $m->price,
                    'price_fmt' => 'Rp ' . number_format((float) $m->price, 0, ',', '.'),
                    'scope'     => $m->scope,
                ])
            : [];

        return Inertia::render('tickets/show', [
            'ticket'       => $this->transformTicketDetail($ticket),
            'addonModules' => $addonModules,
            'pageConfig'   => [
                'title'       => 'Ticket Detail',
                'description' => 'View and manage ticket details.',
                'can_manage'  => $user->isSuperAdmin(),
            ],
        ]);
    }

    // -------------------------------------------------------------------------
    // SEND MESSAGE (company user & admin)
    // -------------------------------------------------------------------------

    public function sendMessage(Request $request, Ticket $ticket)
    {
        $user = $request->user();

        if (!$user->isSuperAdmin()) {
            abort_if($ticket->company_id !== $user->company->id, 403);
        }

        $request->validate(['message' => 'required|string']);

        $ticket->messages()->create([
            'user_id' => $user->id,
            'message' => $request->message,
        ]);

        return back()->with('success', 'Message sent.');
    }

    // -------------------------------------------------------------------------
    // ASSIGN (admin assigns to self)
    // -------------------------------------------------------------------------

    public function assign(Request $request, Ticket $ticket)
    {
        abort_unless($request->user()->isSuperAdmin(), 403);

        $fromStatus = $ticket->status;

        $ticket->update([
            'assigned_to' => $request->user()->id,
            'status'      => 'in_progress',
        ]);

        TicketStatusHistory::create([
            'ticket_id'   => $ticket->id,
            'from_status' => $fromStatus,
            'to_status'   => 'in_progress',
            'changed_by'  => $request->user()->id,
            'note'        => 'Assigned to ' . $request->user()->name,
        ]);

        return back()->with('success', 'Ticket assigned and set to in progress.');
    }

    // -------------------------------------------------------------------------
    // UPDATE STATUS (admin)
    // -------------------------------------------------------------------------

    public function updateStatus(Request $request, Ticket $ticket)
    {
        abort_unless($request->user()->isSuperAdmin(), 403);

        $request->validate([
            'status' => 'required|in:open,in_progress,review,resolved,closed',
            'note'   => 'nullable|string',
        ]);

        $fromStatus = $ticket->status;
        $toStatus   = $request->status;

        $updates = ['status' => $toStatus];
        if ($toStatus === 'resolved') $updates['resolved_at'] = now();
        if ($toStatus === 'closed')   $updates['closed_at']   = now();

        $ticket->update($updates);

        TicketStatusHistory::create([
            'ticket_id'   => $ticket->id,
            'from_status' => $fromStatus,
            'to_status'   => $toStatus,
            'changed_by'  => $request->user()->id,
            'note'        => $request->note,
        ]);

        return back()->with('success', 'Ticket status updated.');
    }

    // -------------------------------------------------------------------------
    // CREATE PROPOSAL (admin — for feature_request type)
    // -------------------------------------------------------------------------

    public function storeProposal(Request $request, Ticket $ticket)
    {
        abort_unless($request->user()->isSuperAdmin(), 403);
        abort_if($ticket->type !== 'feature_request', 422, 'Proposals only apply to feature requests.');

        $request->validate([
            'estimated_price' => 'required|numeric|min:0',
            'estimated_days'  => 'required|integer|min:1',
            'module_id'       => 'required|exists:modules,id',
        ]);

        $ticket->proposal()->updateOrCreate(
            ['ticket_id' => $ticket->id],
            [
                'estimated_price' => $request->estimated_price,
                'estimated_days'  => $request->estimated_days,
                'module_id'       => $request->module_id,
                'status'          => 'pending',
            ]
        );

        return back()->with('success', 'Proposal sent to company.');
    }

    // -------------------------------------------------------------------------
    // APPROVE PROPOSAL (company user)
    // -------------------------------------------------------------------------

    public function approveProposal(Request $request, Ticket $ticket)
    {
        $user = $request->user();
        abort_if($user->isSuperAdmin(), 403);
        abort_if($ticket->company_id !== $user->company->id, 403);

        $proposal = $ticket->proposal;
        abort_if(!$proposal || $proposal->status !== 'pending', 422, 'No pending proposal to approve.');

        DB::transaction(function () use ($ticket, $proposal, $user) {
            // Approve proposal — module langsung aktif sekarang
            $proposal->update([
                'status'      => 'approved',
                'approved_at' => now(),
            ]);

            // Aktifkan module untuk company langsung
            \App\Models\CompanyAddOn::updateOrCreate(
                [
                    'company_id' => $ticket->company_id,
                    'module_id'  => $proposal->module_id,
                ],
                [
                    'is_active'  => true,
                    'started_at' => now(),
                    'expired_at' => null,
                ]
            );

            // Ticket masuk status review — menunggu ditagih di invoice berikutnya
            $ticket->update(['status' => 'review']);

            TicketStatusHistory::create([
                'ticket_id'   => $ticket->id,
                'from_status' => 'in_progress',
                'to_status'   => 'review',
                'changed_by'  => $user->id,
                'note'        => 'Proposal approved. Module activated. Will be billed on next invoice renewal.',
            ]);
        });

        return back()->with('success', 'Proposal approved. Module is now active. The cost will be included in your next invoice.');
    }

    // -------------------------------------------------------------------------
    // TRANSFORMERS
    // -------------------------------------------------------------------------

    private function transformTicket(Ticket $ticket): array
    {
        return [
            'id'          => $ticket->id,
            'code'        => $ticket->code,
            'title'       => $ticket->title,
            'type'        => $ticket->type,
            'priority'    => $ticket->priority,
            'status'      => $ticket->status,
            'created_at'  => $ticket->created_at,
            'resolved_at' => $ticket->resolved_at,
            'company'     => $ticket->relationLoaded('company') && $ticket->company
                ? ['id' => $ticket->company->id, 'name' => $ticket->company->name]
                : null,
            'assignee'    => $ticket->relationLoaded('assignee') && $ticket->assignee
                ? ['id' => $ticket->assignee->id, 'name' => $ticket->assignee->name]
                : null,
        ];
    }

    private function transformTicketDetail(Ticket $ticket): array
    {
        $base = $this->transformTicket($ticket);

        return array_merge($base, [
            'description' => $ticket->description,
            'closed_at'   => $ticket->closed_at,
            'messages'    => $ticket->messages->map(fn($m) => [
                'id'         => $m->id,
                'message'    => $m->message,
                'created_at' => $m->created_at,
                'user'       => ['id' => $m->user->id, 'name' => $m->user->name],
            ]),
            'comments'    => $ticket->comments->map(fn($c) => [
                'id'          => $c->id,
                'comment'     => $c->comment,
                'is_internal' => $c->is_internal,
                'created_at'  => $c->created_at,
                'user'        => ['id' => $c->user->id, 'name' => $c->user->name],
            ]),
            'histories'   => $ticket->histories->map(fn($h) => [
                'id'          => $h->id,
                'from_status' => $h->from_status,
                'to_status'   => $h->to_status,
                'note'        => $h->note,
                'created_at'  => $h->created_at,
                'changed_by'  => ['id' => $h->changedBy->id, 'name' => $h->changedBy->name],
            ]),
            'proposal'    => $ticket->proposal ? [
                'id'              => $ticket->proposal->id,
                'estimated_price' => $ticket->proposal->estimated_price,
                'estimated_days'  => $ticket->proposal->estimated_days,
                'module_id'       => $ticket->proposal->module_id,
                'status'          => $ticket->proposal->status,
                'approved_at'     => $ticket->proposal->approved_at,
                'invoice_add_on'  => $ticket->proposal->invoiceAddOn ? [
                    'id'         => $ticket->proposal->invoiceAddOn->id,
                    'number'     => $ticket->proposal->invoiceAddOn->number,
                    'amount'     => $ticket->proposal->invoiceAddOn->amount,
                    'status'     => $ticket->proposal->invoiceAddOn->status,
                    'snap_token' => $ticket->proposal->invoiceAddOn->snap_token,
                    'due_date'   => $ticket->proposal->invoiceAddOn->due_date,
                ] : null,
            ] : null,
        ]);
    }
}
