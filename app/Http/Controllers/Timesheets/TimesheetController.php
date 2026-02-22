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
            // Hanya ambil project dimana user terlibat atau dia managernya
            ->where(function ($q) use ($user) {
                $q->whereHas('users', fn($sq) => $sq->where('user_id', $user->id))
                    ->orWhereHas('workspace', fn($sq) => $sq->where('manager_id', $user->id));
            })
            ->where('status', 'active')
            ->with([
                'tasks' => function ($query) {
                    $query->select('id', 'project_id', 'title')
                        ->with('subtasks:id,task_id,title,is_completed');
                }
            ])
            ->get(['id', 'name', 'workspace_id']);
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
            'task_id'     => 'required|exists:tasks,id',
            'sub_task_id' => 'nullable|exists:sub_tasks,id',
            'date'        => 'required|date',
            'start_time'  => 'required',
            'end_time'    => 'required',
            'description' => 'required|string',
        ]);

        // Pakai Transaction supaya kalau Header gagal, Entry gak nyangkut
        return DB::transaction(function () use ($request, $validated) {
            $user = $request->user();

            // 1. Cari/Buat Header Timesheet berdasarkan minggu tersebut
            $date = \Carbon\Carbon::parse($validated['date']);
            $startOfWeek = $date->copy()->startOfWeek();

            $timesheet = Timesheet::firstOrCreate([
                'user_id'  => $user->id,
                'start_at' => $startOfWeek->toDateString(),
            ], [
                'workspace_id' => Project::find($validated['project_id'])->workspace_id,
                'task_id'      => $validated['task_id'],
                'sub_task_id'  => $validated['sub_task_id'],
                'note'         => $validated['description'], // Kalau kamu mau simpan note di header juga
                'end_at'       => $startOfWeek->copy()->endOfWeek()->toDateString(),
                'status'       => 'draft',
            ]);

            // 2. Hitung selisih jam (Decimal)
            $start = \Carbon\Carbon::parse($validated['start_time']);
            $end = \Carbon\Carbon::parse($validated['end_time']);
            $hours = $end->diffInMinutes($start) / 60;

            // 3. Simpan ke Entry
            $timesheet->entries()->create([
                'user_id'     => $user->id,
                'project_id'  => $validated['project_id'],
                'task_id'     => $validated['task_id'],
                'sub_task_id' => $validated['sub_task_id'],
                'date'        => $validated['date'],
                'start_at'    => $validated['start_time'],
                'end_at'      => $validated['end_time'],
                'hours'       => number_format($hours, 2),
                'description' => $validated['description'],
            ]);

            return back()->with('success', 'Work log deployed successfully!');
        });
    }

    // Tambahkan fungsi ini di dalam class TimesheetController

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
}
