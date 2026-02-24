<?php

namespace App\Http\Controllers\Timesheets;

use App\Http\Controllers\Controller;
use App\Models\ProjectManagement\Project;
use App\Models\TaskManagement\Task;
use App\Models\Timesheet\Timesheet;
use App\Models\Timesheet\TimesheetEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class TimesheetController extends Controller
{
    /**
     * Resolve company context based on user role.
     */
    private function resolveCompany($user)
    {
        if ($user->isSuperAdmin()) return null;
        $company = $user->company ?? $user->companyOwner?->company;
        abort_if(!$company, 403, 'Unauthorized: No company association found.');
        return $company;
    }

    /**
     * Helper to get clean project list with tasks for dropdowns.
     */
    private function getProjectsForRegistry($user, $company)
    {
        return Project::query()
            ->whereHas('workspace', function ($q) use ($company, $user) {
                if ($company) $q->where('company_id', $company->id);
            })
            ->where(function ($q) use ($user) {
                $q->whereHas('users', fn($sq) => $sq->where('user_id', $user->id))
                    ->orWhereHas('workspace', fn($sq) => $sq->where('manager_id', $user->id));
            })
            ->where('status', 'active')
            ->with([
                'workspace:id,slug',
                'tasks' => function ($query) {
                    $query->select('id', 'project_id', 'title', 'slug')
                        ->with(['subtasks' => function ($q) {
                            $q->select('id', 'task_id', 'title', 'is_completed', 'completed_by', 'created_at')
                                ->with('completer:id,name');
                        }]);
                }
            ])
            ->get(['id', 'name', 'slug', 'workspace_id']);
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $company = $this->resolveCompany($user);

        // 1. Time Context - Kunci awal minggu ke hari SENIN
        $dateParam = $request->input('date', now()->toDateString());
        $currentDate = Carbon::parse($dateParam);

        // PASTIKAN START OF WEEK ADALAH SENIN (MONDAY)
        $startOfWeek = $currentDate->copy()->startOfWeek(Carbon::MONDAY);
        // PASTIKAN END OF WEEK ADALAH MINGGU (SUNDAY)
        $endOfWeek = $currentDate->copy()->endOfWeek(Carbon::SUNDAY);

        // 2. Fetch Data
        $projects = $this->getProjectsForRegistry($user, $company);

        // Cari Timesheet berdasarkan tanggal mulai (Senin)
        $currentTimesheet = Timesheet::where('user_id', $user->id)
            ->where('start_at', $startOfWeek->toDateString())
            ->with(['entries.task', 'entries.subTask', 'entries.project'])
            ->first();

        // 3. Stats Calculation
        $stats = [
            'totalHoursWeek' => 0,
            'approvedHours'  => 0,
            'pendingHours'   => 0,
            'draftHours'     => 0,
        ];

        if ($currentTimesheet) {
            $entries = $currentTimesheet->entries;
            $stats['totalHoursWeek'] = round($entries->sum('hours'), 2);
            $stats['approvedHours']  = round($entries->where('status', 'approved')->sum('hours'), 2);
            $stats['pendingHours']   = round($entries->where('status', 'submitted')->sum('hours'), 2);
            $stats['draftHours']     = round($entries->whereIn('status', ['draft', 'revision'])->sum('hours'), 2);
        }

        // Mapping Entries untuk Frontend Grid
        $mappedEntries = [];
        if ($currentTimesheet) {
            $mappedEntries = $currentTimesheet->entries->map(function ($entry) {
                return [
                    'id'          => $entry->id,
                    'taskName'    => $entry->task?->title ?? $entry->description,
                    'date'        => $entry->date,
                    'startTime'   => Carbon::parse($entry->start_at)->format('H:i'),
                    'endTime'     => Carbon::parse($entry->end_at)->format('H:i'),
                    'status'      => $entry->status ?? 'draft',

                    'project_id'  => $entry->project_id,
                    'task_id'     => $entry->task_id,
                    'sub_task_id' => $entry->sub_task_id,
                    'description' => $entry->description,
                    'reject_reason' => $entry->reject_reason, // Tambahkan ini agar pesan reject masuk ke modal
                    'attachment'  => $entry->attachment,
                ];
            });
        }

        // Data untuk tab Manager Review
        $pendingLogs = [];
        if ($user->hasAnyRole(['company', 'manager', 'super-admin'])) {
            $pendingLogs = Timesheet::where('status', 'submitted')
                ->whereHas('user', function ($q) use ($company) {
                    if ($company) {
                        $q->where('company_id', $company->id);
                    }
                })
                ->with(['user:id,name', 'entries.project', 'entries.task'])
                ->get();
        }

        return Inertia::render('timesheets/index', [
            'projects'   => $projects,
            'timesheets' => [
                'current' => $currentTimesheet,
                'mapped'  => $mappedEntries,
                'history' => Timesheet::where('user_id', $user->id)
                    ->with(['entries.project', 'entries.task'])
                    ->latest('start_at') // Urutkan berdasarkan minggu terbaru
                    ->paginate(20)
            ],
            'stats'           => $stats,
            'currentDateProp' => $currentDate->toDateString(),
            'pageConfig'      => [
                'can_manage' => $user->hasAnyRole(['company', 'manager', 'super-admin'])
            ],
            'pendingLogs' => $pendingLogs,
        ]);
    }

    public function storeTask(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'title'      => 'required|string|max:255',
            'priority'   => 'required|in:low,medium,high',
        ]);

        $project = Project::findOrFail($validated['project_id']);

        $task = $project->tasks()->create([
            'title' => $validated['title'],
            'priority' => $validated['priority'],
            'status' => 'backlog',
            'workspace_id' => $project->workspace_id,
        ]);

        return back()->with('success', 'Task created and linked.');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id'  => 'required|exists:projects,id',
            'task_id'     => 'nullable|exists:tasks,id',
            'sub_task_id' => 'nullable|exists:sub_tasks,id',
            'date'        => 'required|date',
            'start_time'  => 'required|date_format:H:i',
            'end_time'    => 'required|date_format:H:i',
            'description' => 'required|string',
            'attachments'   => 'nullable|array',
            'attachments.*' => 'file|mimes:jpg,jpeg,png,pdf,zip|max:2048',
        ]);

        // LOGIC MULTIPLE UPLOAD
        $attachmentPaths = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $attachmentPaths[] = $file->store('attachments', 'public');
            }
        }

        $user = $request->user();
        $project = Project::findOrFail($validated['project_id']);
        $date = Carbon::parse($validated['date']);

        // 1. Kunci start_at di Senin, end_at di Minggu
        $startOfWeek = $date->copy()->startOfWeek(Carbon::MONDAY);
        $endOfWeek = $date->copy()->endOfWeek(Carbon::SUNDAY);

        // 2. Create or Find the Parent Timesheet
        $timesheet = Timesheet::firstOrCreate(
            [
                'user_id'  => $user->id,
                'start_at' => $startOfWeek->format('Y-m-d'),
                'end_at'   => $endOfWeek->format('Y-m-d'),
            ],
            [
                'workspace_id' => $project->workspace_id,
                'status'       => 'draft',
                'total_hours'  => 0,
            ]
        );

        $start = Carbon::parse($validated['start_time']);
        $end = Carbon::parse($validated['end_time']);
        $hours = $start->diffInMinutes($end) / 60;

        // 3. Create the Timesheet Entry
        $timesheet->entries()->create([
            'user_id'     => $user->id,
            'project_id'  => $validated['project_id'],
            'task_id'     => $validated['task_id'],
            'sub_task_id' => $validated['sub_task_id'],
            'date'        => $validated['date'],
            'start_at'    => $validated['start_time'],
            'end_at'      => $validated['end_time'],
            'hours'       => round($hours, 2),
            'description' => $validated['description'],
            'status'      => 'draft',
            'attachment'  => !empty($attachmentPaths) ? json_encode($attachmentPaths) : null,
        ]);

        // 4. Update the total hours
        $timesheet->calculateTotals();

        return back()->with('success', 'Time entry logged successfully.');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'project_id'           => 'required|exists:projects,id',
            'task_id'              => 'nullable|exists:tasks,id',
            'sub_task_id'          => 'nullable|exists:sub_tasks,id',
            'date'                 => 'required|date',
            'start_time'           => 'required|date_format:H:i',
            'end_time'             => 'required|date_format:H:i',
            'description'          => 'required|string',
            'existing_attachments' => 'nullable|array',
            'attachments'          => 'nullable|array',
            'attachments.*'        => 'file|mimes:jpg,jpeg,png,pdf,zip|max:2048',
        ]);

        $entry = TimesheetEntry::findOrFail($id);

        $keptAttachments = $request->input('existing_attachments', []);

        $oldAttachments = $entry->attachment ? json_decode($entry->attachment, true) : [];
        if (!is_array($oldAttachments)) {
            $oldAttachments = [$entry->attachment]; // Berjaga-jaga kalau datanya masih string lawas
        }

        // Hapus file dari storage jika user membuangnya di frontend
        $deletedAttachments = array_diff($oldAttachments, $keptAttachments);
        foreach ($deletedAttachments as $deletedFile) {
            if ($deletedFile) {
                \Storage::disk('public')->delete($deletedFile);
            }
        }

        // Mulai kumpulkan path akhir dari file yang dipertahankan
        $finalAttachmentPaths = $keptAttachments;

        // 2. TANGANI FILE BARU YANG DI-UPLOAD
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $finalAttachmentPaths[] = $file->store('attachments', 'public');
            }
        }

        // 3. KALKULASI WAKTU
        $start = Carbon::parse($validated['start_time']);
        $end = Carbon::parse($validated['end_time']);
        $hours = $start->diffInMinutes($end) / 60;

        $entry->update([
            'project_id'    => $validated['project_id'],
            'task_id'       => $validated['task_id'],
            'sub_task_id'   => $validated['sub_task_id'],
            'date'          => $validated['date'],
            'start_at'      => $validated['start_time'],
            'end_at'        => $validated['end_time'],
            'hours'         => round($hours, 2),
            'description'   => $validated['description'],
            // Encode menjadi JSON untuk disimpan
            'attachment'    => !empty($finalAttachmentPaths) ? json_encode(array_values($finalAttachmentPaths)) : null,
            'status'        => 'draft',
            'reject_reason' => null,
        ]);

        if ($entry->timesheet) {
            $entry->timesheet->calculateTotals();
        }

        return back()->with('success', 'Time entry updated successfully.');
    }

    public function updateTime(Request $request, $id)
    {
        $validated = $request->validate([
            'start_time' => 'required|date_format:H:i',
            'end_time'   => 'required|date_format:H:i',
        ]);

        $entry = TimesheetEntry::findOrFail($id);

        $start = Carbon::parse($validated['start_time']);
        $end = Carbon::parse($validated['end_time']);
        $hours = $start->diffInMinutes($end) / 60;

        $entry->update([
            'start_at' => $validated['start_time'],
            'end_at'   => $validated['end_time'],
            'hours'    => round($hours, 2),
            // Jika direvisi (lewat drag n drop), otomatis hapus pesan reject
            'status'        => 'draft',
            'reject_reason' => null,
        ]);

        if ($entry->timesheet) {
            $entry->timesheet->calculateTotals();
        }

        return back()->with('success', 'Operational time modified successfully.');
    }

    public function destroy($id)
    {
        $entry = TimesheetEntry::findOrFail($id);
        $timesheet = $entry->timesheet;

        $entry->delete();

        if ($timesheet) {
            $timesheet->calculateTotals();
        }

        return back()->with('success', 'Time entry deleted successfully.');
    }

    public function submit(Request $request, $id)
    {
        // Gunakan findOrFail agar kebal dari error Route Model Binding
        $timesheet = Timesheet::findOrFail($id);

        abort_if($timesheet->user_id !== $request->user()->id, 403, 'Akses ditolak.');

        DB::transaction(function () use ($timesheet) {
            // Ubah status timesheet induk
            $timesheet->update([
                'status' => 'submitted',
                'updated_at' => now(),
            ]);

            // Ubah status anak-anaknya (entries)
            $timesheet->entries()->update([
                'status' => 'submitted',
                'reject_reason' => null
            ]);
        });

        return back()->with('success', 'Timesheet berhasil dikirim untuk di-review Manager.');
    }

    public function approve(Request $request, $id)
    {
        $timesheet = Timesheet::findOrFail($id);

        DB::transaction(function () use ($request, $timesheet) {
            $timesheet->update(['status' => 'approved']);

            $timesheet->entries()->update([
                'status' => 'approved',
                'reject_reason' => null
            ]);

            $timesheet->approvals()->create([
                'approver_id' => $request->user()->id,
                'status'      => 'approved',
                'comments'    => 'Approved via Manager Review',
            ]);
        });

        return back()->with('success', 'Timesheet Authorized.');
    }

    public function reject(Request $request, $id)
    {
        $request->validate(['reason' => 'required|string']);

        $timesheet = Timesheet::findOrFail($id);

        DB::transaction(function () use ($request, $timesheet) {
            $timesheet->update(['status' => 'revision']);

            $timesheet->approvals()->create([
                'approver_id' => $request->user()->id,
                'status'      => 'rejected',
                'comments'    => $request->reason,
            ]);
        });

        return back()->with('success', 'Timesheet sent back for revision.');
    }

    public function rejectEntry(Request $request, $id)
    {
        $request->validate(['reason' => 'required|string']);

        $entry = TimesheetEntry::findOrFail($id);

        DB::transaction(function () use ($request, $entry) {
            $entry->update([
                'status'        => 'revision',
                'reject_reason' => $request->reason,
            ]);

            if ($entry->timesheet && $entry->timesheet->status !== 'revision') {
                $entry->timesheet->update(['status' => 'revision']);
            }
        });

        return back()->with('success', 'Entry flagged for revision.');
    }

    //khusus di task buat perhari, jadi tidak perlu update timesheet
    public function approveEntry(Request $request, $id)
    {
        $entry = TimesheetEntry::findOrFail($id);

        DB::transaction(function () use ($entry) {
            $entry->update([
                'status'        => 'approved',
                'reject_reason' => null,
            ]);

            $timesheet = $entry->timesheet;
            if ($timesheet && $timesheet->entries()->where('status', '!=', 'approved')->count() === 0) {
                $timesheet->update(['status' => 'approved']);
            }
        });

        return back()->with('success', 'Operational log authorized.');
    }
}
