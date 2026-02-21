<?php

namespace App\Http\Controllers\Timesheets;

use App\Http\Controllers\Controller;
use App\Models\TaskManagement\Task;
use App\Models\Timesheet\Timesheet;
use App\Models\Timesheet\TimesheetEntry;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class TimesheetController extends Controller
{
    // Tambahkan helper ini agar sinkron dengan sistem Company
    private function resolveCompany($user)
    {
        if ($user->isSuperAdmin()) return null;
        $company = $user->company ?? $user->companyOwner?->company;
        abort_if(!$company, 403, 'Anda tidak terikat dengan perusahaan manapun.');
        return $company;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $company = $this->resolveCompany($user);

        $currentDate = Carbon::parse($request->input('date', now()));
        $startOfWeek = $currentDate->copy()->startOfWeek();
        $endOfWeek = $currentDate->copy()->endOfWeek();

        // Security: Hanya ambil workspace milik company user ini
        $defaultWorkspace = Workspace::where(function ($q) use ($user, $company) {
            if (!$user->isSuperAdmin()) {
                $q->where('company_id', $company->id);
            }
        })
            ->where(function ($q) use ($user) {
                $q->whereHas('members', fn($sq) => $sq->where('user_id', $user->id))
                    ->orWhere('manager_id', $user->id);
            })->first();

        $timesheet = Timesheet::where('user_id', $user->id)
            ->where('start_at', $startOfWeek->toDateString())
            ->with(['entries.task', 'entries.subTask'])
            ->first();
        $formattedEntries = $timesheet ? $timesheet->entries->map(fn($entry) => [
            'id' => (string)$entry->id,
            'taskName' => $entry->task?->title,
            'subtaskName' => $entry->subTask?->title,
            'startTime' => Carbon::parse($entry->start_at)->format('H:i'), // Pakai start_at
            'endTime' => Carbon::parse($entry->end_at)->format('H:i'),     // Pakai end_at
            'date' => Carbon::parse($entry->start_at)->format('Y-m-d'),
            'description' => $entry->note, // Pakai note
            'status' => $timesheet->status,
        ]) : [];

        return Inertia::render('timesheets/index', [
            'timesheets' => [
                'data' => $formattedEntries
            ],
            // Security: Hanya tampilkan task yang relevan dengan workspace user
            'tasks' => Task::with('subtasks')->get(),
            'workspace' => $defaultWorkspace,
            'currentDateProp' => $currentDate->toDateString(),
            'stats' => [
                'total' => $timesheet ? (float)$timesheet->total_hours : 0,
                'status' => $timesheet->status ?? 'draft'
            ],
            'pageConfig' => [
                'can_manage' => $user->hasAnyPermission(['manage-timesheets', 'create-timesheets']) // Tambahkan ini
            ]
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $company = $this->resolveCompany($user);

        $validated = $request->validate([
            'task_id' => 'required|exists:tasks,id',
            'sub_task_id' => 'nullable|exists:sub_tasks,id',
            'date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'description' => 'required|string',
            'workspace_id' => 'required|exists:workspaces,id',
        ]);

        // Security: Pastikan workspace yang dikirim milik company si user
        if (!$user->isSuperAdmin()) {
            $ws = Workspace::find($validated['workspace_id']);
            abort_if($ws->company_id !== $company->id, 403, 'Unauthorized workspace.');
        }

        $date = Carbon::parse($validated['date']);
        $startOfWeek = $date->copy()->startOfWeek();
        $endOfWeek = $date->copy()->endOfWeek();

        return DB::transaction(function () use ($user, $validated, $startOfWeek, $endOfWeek) {

            $timesheet = Timesheet::firstOrCreate([
                'user_id' => $user->id,
                'start_at' => $startOfWeek->toDateString(), // Pastikan kolom ini ada di tabel 'timesheets'
                'end_at' => $endOfWeek->toDateString(),
            ], [
                'workspace_id' => $validated['workspace_id'],
                'status' => 'draft',
            ]);

            $start = Carbon::parse($validated['date'] . ' ' . $validated['start_time']);
            $end = Carbon::parse($validated['date'] . ' ' . $validated['end_time']);
            $duration = $end->diffInMinutes($start);

            $timesheet->entries()->create([
                'user_id' => $user->id,
                'workspace_id' => $validated['workspace_id'],
                'task_id' => $validated['task_id'],
                'sub_task_id' => $validated['sub_task_id'],
                'note' => $validated['description'], // Mapping description ke note
                'start_at' => $start,
                'end_at' => $end,
                'duration_minutes' => $duration,
            ]);

            return back()->with('success', 'Time logged successfully.');
        });
    }
}
