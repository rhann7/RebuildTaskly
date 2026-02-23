<?php

namespace App\Http\Controllers\Timesheets;

use App\Http\Controllers\Controller;
use App\Models\ProjectManagement\Project;
use App\Models\TaskManagement\Task;
use App\Models\Timesheet\Timesheet;
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
                        // PERBAIKAN DI SINI:
                        ->with(['subtasks' => function ($q) {
                            $q->select('id', 'task_id', 'title', 'is_completed', 'completed_by', 'created_at')
                                ->with('completer:id,name'); // Load nama yang mencentang
                        }]);
                }
            ])
            ->get(['id', 'name', 'slug', 'workspace_id']);
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $company = $this->resolveCompany($user);

        // 1. Time Context
        $dateParam = $request->input('date', now()->toDateString());
        $currentDate = Carbon::parse($dateParam);
        $startOfWeek = $currentDate->copy()->startOfWeek();

        // 2. Fetch Data
        $projects = $this->getProjectsForRegistry($user, $company);

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
            $stats['totalHoursWeek'] = round($entries->sum('duration_minutes') / 60, 2);
            $stats['approvedHours']  = round($entries->where('status', 'approved')->sum('duration_minutes') / 60, 2);
            $stats['pendingHours']   = round($entries->where('status', 'submitted')->sum('duration_minutes') / 60, 2);
            $stats['draftHours']     = round($entries->where('status', 'draft')->sum('duration_minutes') / 60, 2);
        }
        //  
        $mappedEntries = [];
        if ($currentTimesheet) {
            $mappedEntries = $currentTimesheet->entries->map(function ($entry) {
                return [
                    'id'          => $entry->id,
                    'taskName'    => $entry->task?->title ?? $entry->description,
                    'date'        => $entry->date,
                    'startTime'   => \Carbon\Carbon::parse($entry->start_at)->format('H:i'),
                    'endTime'     => \Carbon\Carbon::parse($entry->end_at)->format('H:i'),
                    'status'      => $entry->status ?? 'draft',

                    // --- WAJIB TAMBAHKAN INI AGAR BISA DI-EDIT ---
                    'project_id'  => $entry->project_id,
                    'task_id'     => $entry->task_id,
                    'sub_task_id' => $entry->sub_task_id,
                    'description' => $entry->description,
                ];
            });
        }
        // 5. Return to Inertia (HAPUS BAGIAN AUTH!)
        return Inertia::render('timesheets/index', [
            'projects'   => $projects,
            'timesheets' => [
                'current' => $currentTimesheet,
                'mapped'  => $mappedEntries,
                'history' => Timesheet::where('user_id', $user->id)
                    ->latest()
                    ->paginate(20)
            ],
            'stats'           => $stats,
            'currentDateProp' => $currentDate->toDateString(),
            'pageConfig'      => [
                'can_manage' => $user->hasAnyPermission(['manage-timesheets', 'create-timesheets'])
            ],
        ]);
    }

    public function storeTask(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'title'      => 'required|string|max:255',
            'priority'   => 'required|in:low,medium,high',
        ]);

        // Simpan task baru ke project tersebut
        // Sesuaikan dengan logic Task management kamu, ini contoh umum:
        $project = Project::findOrFail($validated['project_id']);

        $task = $project->tasks()->create([
            'title' => $validated['title'],
            'priority' => $validated['priority'],
            'status' => 'backlog', // atau status default kamu
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
        ]);

        $user = $request->user();

        $project = \App\Models\ProjectManagement\Project::findOrFail($validated['project_id']);

        $date = \Carbon\Carbon::parse($validated['date']);
        $startOfWeek = $date->copy()->startOfWeek(\Carbon\Carbon::MONDAY);
        $endOfWeek = $date->copy()->endOfWeek(\Carbon\Carbon::SUNDAY);

        // 1. Create or Find the Parent Timesheet
        $timesheet = \App\Models\Timesheet\Timesheet::firstOrCreate(
            [
                'user_id'    => $user->id,
                'start_at'   => $startOfWeek->format('Y-m-d'),
                'end_at'     => $endOfWeek->format('Y-m-d'),
            ],
            [
                'workspace_id' => $project->workspace_id,
                'status'       => 'draft',
                'total_hours'  => 0,
            ]
        );

        $start = \Carbon\Carbon::parse($validated['start_time']);
        $end = \Carbon\Carbon::parse($validated['end_time']);

        // Ensure hours are calculated correctly (End minus Start)
        $hours = $start->diffInMinutes($end) / 60;

        // 2. Create the Timesheet Entry (Adding user_id here!)
        $timesheet->entries()->create([
            'user_id'     => $user->id, // <--- ADDED THIS LINE
            'project_id'  => $validated['project_id'],
            'task_id'     => $validated['task_id'],
            'sub_task_id' => $validated['sub_task_id'],
            'date'        => $validated['date'],
            'start_at'    => $validated['start_time'],
            'end_at'      => $validated['end_time'],
            'hours'       => round($hours, 2),
            'description' => $validated['description'],
        ]);

        // 3. Update the total hours
        $timesheet->calculateTotals();

        return back()->with('success', 'Time entry logged successfully.');
    }

    public function update(Request $request, $id)
    {
        // 1. Validate the incoming data
        $validated = $request->validate([
            'project_id'  => 'required|exists:projects,id',
            'task_id'     => 'nullable|exists:tasks,id',
            'sub_task_id' => 'nullable|exists:sub_tasks,id',
            'date'        => 'required|date',
            'start_time'  => 'required|date_format:H:i',
            'end_time'    => 'required|date_format:H:i',
            'description' => 'required|string',
        ]);

        // 2. Find the entry by ID
        $entry = \App\Models\Timesheet\TimesheetEntry::findOrFail($id);

        // 3. Calculate total hours for this specific entry
        $start = \Carbon\Carbon::parse($validated['start_time']);
        $end = \Carbon\Carbon::parse($validated['end_time']);

        // Ensure start time is before end time for calculation
        $hours = $start->diffInMinutes($end) / 60;

        // 4. Update the database record
        $entry->update([
            'project_id'  => $validated['project_id'],
            'task_id'     => $validated['task_id'],
            'sub_task_id' => $validated['sub_task_id'],
            'date'        => $validated['date'],
            'start_at'    => $validated['start_time'],
            'end_at'      => $validated['end_time'],
            'hours'       => round($hours, 2),
            'description' => $validated['description'],
        ]);

        // 5. Recalculate total hours for the parent Timesheet
        if ($entry->timesheet) {
            $entry->timesheet->calculateTotals();
        }

        // 6. Return response
        return back()->with('success', 'Time entry updated successfully.');
    }

    public function updateTime(Request $request, $id)
    {
        $validated = $request->validate([
            'start_time' => 'required|date_format:H:i',
            'end_time'   => 'required|date_format:H:i',
        ]);

        $entry = \App\Models\Timesheet\TimesheetEntry::findOrFail($id);

        $start = \Carbon\Carbon::parse($validated['start_time']);
        $end = \Carbon\Carbon::parse($validated['end_time']);

        // PERBAIKAN PENTING: $start duluan, baru $end agar hasilnya POSITIF
        $hours = $start->diffInMinutes($end) / 60;

        $entry->update([
            'start_at' => $validated['start_time'],
            'end_at'   => $validated['end_time'],
            'hours'    => round($hours, 2),
        ]);

        if ($entry->timesheet) {
            $entry->timesheet->calculateTotals();
        }

        return back()->with('success', 'Operational time modified successfully.');
    }
    public function destroy($id)
    {
        $entry = \App\Models\Timesheet\TimesheetEntry::findOrFail($id);
        $timesheet = $entry->timesheet;

        $entry->delete();

        // Kalkulasi ulang total jam di header setelah detail dihapus
        if ($timesheet) {
            $timesheet->calculateTotals();
        }

        return back()->with('success', 'Time entry deleted successfully.');
    }
}
