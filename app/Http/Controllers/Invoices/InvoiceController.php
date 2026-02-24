<?php

namespace App\Http\Controllers\Invoices;

use App\Http\Controllers\Controller;
use App\Http\Requests\Invoices\InvoiceRequest;
use App\Models\Invoice;
use App\Models\Plan;
use App\Models\TicketProposal;
use App\Models\TicketStatusHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Midtrans\Config;
use Midtrans\Snap;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $invoices = Invoice::query()
            ->with(['company', 'plan'])
            ->when(!$user->isSuperAdmin(), fn($q) => $q->forCompany($user->company->id))
            ->when($request->search, fn($q, $s) => $q->where('number', 'like', "%{$s}%"))
            ->when($request->status, function ($q, $s) {
                if ($s === 'unpaid')   return $q->unpaid();
                if ($s === 'paid')     return $q->where('status', 'paid');
                if ($s === 'expired')  return $q->where('status', 'expired');
                if ($s === 'canceled') return $q->where('status', 'canceled');
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('invoices/index', [
            'invoices'   => $this->transformInvoices($invoices),
            'filters'    => $request->only(['search', 'status']),
            'pageConfig' => $this->getPageConfig($request),
        ]);
    }

    public function create(Request $request, Invoice $invoice)
    {
        $invoice->load(['company', 'plan', 'proposals.module']);

        return Inertia::render('invoices/create', [
            'invoice'    => $this->transformSingleInvoice($invoice),
            'pageConfig' => [
                'title'       => 'Review Invoice',
                'description' => 'Review your invoice before proceeding to payment.',
                'can_manage'  => $request->user()->isSuperAdmin(),
            ],
        ]);
    }

    public function store(InvoiceRequest $request)
    {
        $plan    = Plan::findOrFail($request->plan_id);
        $company = $request->user()->company;

        $invoice = Invoice::forCompany($company->id)
            ->where('plan_id', $plan->id)
            ->unpaid()
            ->where('due_date', '>', now())
            ->first();

        if (!$invoice) {
            $unbilledProposals = TicketProposal::unbilled()
                ->whereHas('ticket', fn($q) => $q->where('company_id', $company->id))
                ->get();

            $totalAmount = $plan->price + $unbilledProposals->sum('estimated_price');

            DB::transaction(function () use (&$invoice, $company, $plan, $totalAmount, $unbilledProposals) {
                $invoice = Invoice::create([
                    'company_id'    => $company->id,
                    'plan_id'       => $plan->id,
                    'plan_name'     => $plan->name,
                    'amount'        => $totalAmount,  // ← harga plan + semua add-on
                    'plan_duration' => $plan->duration,
                    'status'        => 'unpaid',
                    'due_date'      => now()->addHours(24),
                ]);

                // Link proposals ke invoice ini
                if ($unbilledProposals->isNotEmpty()) {
                    $unbilledProposals->each(fn($p) => $p->update(['invoice_id' => $invoice->id]));
                }
            });
        }

        return redirect()->route('invoices.create', ['invoice' => $invoice->id]);
    }

    public function show(Request $request, Invoice $invoice)
    {
        if (!$request->user()->isSuperAdmin()) abort_if($invoice->company_id !== $request->user()->company->id, 403, 'Access denied.');

        $invoice->load(['company', 'plan', 'proposals.module']);

        return Inertia::render('invoices/show', [
            'invoice'    => $this->transformSingleInvoice($invoice),
            'pageConfig' => [
                'title'       => 'Invoice Detail',
                'description' => 'View invoice details and payment status.',
                'can_manage'  => $request->user()->isSuperAdmin(),
            ],
        ]);
    }

    public function createPayment(Invoice $invoice)
    {
        $invoice->load('company');

        if (!$invoice->is_payable) {
            return redirect()->back()->with('error', 'Invoice is no longer payable.');
        }

        Config::$serverKey    = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized  = true;
        Config::$is3ds        = true;

        $snapToken = Snap::getSnapToken([
            'transaction_details' => [
                'order_id'     => $invoice->number,
                'gross_amount' => $invoice->amount,
            ],
            'customer_details' => [
                'first_name' => $invoice->company->name,
                'email'      => $invoice->company->email,
            ],
        ]);

        $invoice->update(['snap_token' => $snapToken]);
        $invoice->load('plan', 'proposals.module');

        return response()->json(['invoice' => $this->transformSingleInvoice($invoice)]);
    }

    public function cancel(Invoice $invoice)
    {
        abort_if($invoice->status !== 'unpaid', 403, 'Only unpaid invoices can be canceled.');
        DB::transaction(function () use ($invoice) {
            $invoice->proposals()->update(['invoice_id' => null]); // ← TAMBAHAN: unlink proposals
            $invoice->update(['status' => 'canceled']);
        });
        return redirect()->route('invoices.index')->with('success', 'Invoice canceled.');
    }

    public function callback(Request $request)
    {
        $signatureKey = hash(
            'sha512',
            $request->order_id .
                $request->status_code .
                $request->gross_amount .
                config('midtrans.server_key')
        );
        if ($signatureKey !== $request->signature_key) abort(403);

        $invoice = Invoice::byNumber($request->order_id)->firstOrFail();

        $transactionStatus = $request->transaction_status;
        $paymentType       = $request->payment_type;
        $paymentReference  = $request->transaction_id;

        if (in_array($transactionStatus, ['capture', 'settlement'])) {
            DB::transaction(function () use ($invoice, $paymentType, $paymentReference) {
                $invoice->update([
                    'status'            => 'paid',
                    'payment_method'    => $paymentType,
                    'payment_reference' => $paymentReference,
                    'paid_at'           => now(),
                ]);

                $invoice->company->subscriptions()
                    ->where('status', 'active')
                    ->update(['status' => 'overridden']);

                $invoice->subscription()->create([
                    'company_id' => $invoice->company_id,
                    'plan_id'    => $invoice->plan_id,
                    'invoice_id' => $invoice->id,
                    'plan_name'  => $invoice->plan_name,
                    'starts_at'  => now(),
                    'ends_at'    => now()->addDays($invoice->plan_duration),
                    'status'     => 'active',
                ]);

                foreach ($invoice->proposals()->with('ticket')->get() as $proposal) {
                    $proposal->update(['status' => 'billed']);

                    $ticket = $proposal->ticket;
                    if ($ticket && $ticket->status === 'review') {
                        $ticket->update(['status' => 'closed', 'closed_at' => now()]);

                        TicketStatusHistory::create([
                            'ticket_id'   => $ticket->id,
                            'from_status' => 'review',
                            'to_status'   => 'closed',
                            'changed_by'  => $ticket->created_by,
                            'note'        => 'Invoice paid. Add-on billed. Ticket closed.',
                        ]);
                    }
                }
            });
        } elseif ($transactionStatus === 'cancel') {
            DB::transaction(function () use ($invoice) {
                $invoice->proposals()->update(['invoice_id' => null]); // ← TAMBAHAN
                $invoice->update(['status' => 'canceled']);
            });
        } elseif ($transactionStatus === 'expire') {
            DB::transaction(function () use ($invoice) {
                $invoice->proposals()->update(['invoice_id' => null]); // ← TAMBAHAN
                $invoice->update(['status' => 'expired']);
            });
        }

        return response()->json(['status' => 'ok']);
    }

    private function transformSingleInvoice(Invoice $invoice)
    {
        // ← TAMBAHAN: map proposals jika ada
        $proposals = $invoice->relationLoaded('proposals')
            ? $invoice->proposals->map(fn($p) => [
                'id'              => $p->id,
                'module_name'     => $p->module?->name ?? 'Add-On Module',
                'ticket_title'    => $p->ticket?->title ?? null,
                'estimated_price' => (float) $p->estimated_price,
            ])->values()->all()
            : [];
        return [
            'id'                => $invoice->id,
            'number'            => $invoice->number,
            'plan_name'         => $invoice->plan_name,
            'amount'            => $invoice->amount,
            'formatted_amount'  => $invoice->formatted_amount,
            'original_price'    => $invoice->plan ? (float) $invoice->plan->original_price : null,
            'plan_duration'     => $invoice->plan_duration,
            'status'            => $invoice->status,
            'snap_token'        => $invoice->snap_token,
            'payment_reference' => $invoice->payment_reference,
            'payment_method'    => $invoice->payment_method,
            'due_date'          => $invoice->due_date,
            'paid_at'           => $invoice->paid_at,
            'is_payable'        => $invoice->is_payable,
            'proposals'         => $proposals,
            'company'           => $invoice->relationLoaded('company') && $invoice->company ? [
                'id'            => $invoice->company->id,
                'name'          => $invoice->company->name,
            ] : null,
            'plan'              => $invoice->relationLoaded('plan') && $invoice->plan ? [
                'id'            => $invoice->plan->id,
                'name'          => $invoice->plan->name,
            ] : null,
        ];
    }

    private function transformInvoices($pagination)
    {
        $pagination->getCollection()->transform(fn($i) => $this->transformSingleInvoice($i));
        return $pagination;
    }

    private function getPageConfig(Request $request)
    {
        return [
            'title'       => 'Invoice Management',
            'description' => 'Manage your subscription invoices.',
            'can_manage'  => $request->user()->isSuperAdmin(),
        ];
    }
}
