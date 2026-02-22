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

        // 4. Return to Inertia (HAPUS BAGIAN AUTH!)
        return Inertia::render('timesheets/index', [
            // 'auth' => [...]  <-- HAPUS INI BRO! JANGAN DIKIRIM LAGI!
            
            'projects'   => $projects,
            'timesheets' => [
                'current' => $currentTimesheet,
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
            'project_id'  => 'required|exists:projects,id',
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority'    => 'required|in:low,medium,high',
        ]);

        $task = DB::transaction(function () use ($validated) {
            return Task::create([
                'project_id'  => $validated['project_id'],
                'title'       => $validated['title'],
                'slug'        => Str::slug($validated['title']) . '-' . Str::lower(Str::random(5)),
                'description' => $validated['description'] ?? null,
                'status'      => 'todo',
                'priority'    => $validated['priority'],
            ]);
        });

        return back()->with('success', 'Tactical task deployed to registry.');
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'project_id'  => 'required|exists:projects,id',
            'task_id'     => 'required|exists:tasks,id',
            'sub_task_id' => 'nullable|exists:sub_tasks,id',
            'date'        => 'required|date',
            'start_time'  => 'required', // Format HH:mm
            'end_time'    => 'required', // Format HH:mm
            'description' => 'required|string',
        ]);

        return DB::transaction(function () use ($user, $validated) {
            $date = Carbon::parse($validated['date']);
            $startOfWeek = $date->copy()->startOfWeek();

            $project = Project::findOrFail($validated['project_id']);

            // 1. Ambil/Buat Header (Timesheet)
            $timesheet = Timesheet::firstOrCreate([
                'user_id'  => $user->id,
                'start_at' => $startOfWeek->toDateString(),
            ], [
                'workspace_id' => $project->workspace_id,
                'end_at'       => $startOfWeek->copy()->endOfWeek()->toDateString(),
                'status'       => 'draft',
            ]);

            // 2. Kalkulasi Jam (Hours) untuk kolom decimal
            $startTime = Carbon::parse($validated['start_time']);
            $endTime   = Carbon::parse($validated['end_time']);
            if ($endTime->lessThan($startTime)) $endTime->addDay();

            // Hitung selisih dalam jam (misal 2.5)
            $hours = $endTime->diffInMinutes($startTime) / 60;

            // 3. Simpan ke TimesheetEntry (Sesuai $fillable Model kamu)
            $timesheet->entries()->create([
                'user_id'      => $user->id,
                'project_id'   => $project->id,
                'task_id'      => $validated['task_id'],
                'sub_task_id'  => $validated['sub_task_id'],
                'date'         => $validated['date'],
                'start_at'     => $validated['start_time'], // Sesuai nama kolom di Migration
                'end_at'       => $validated['end_time'],   // Sesuai nama kolom di Migration
                'hours'        => $hours,                   // Decimal 5,2
                'description'  => $validated['description'],
                'is_billable'  => true,
            ]);

            return back()->with('success', 'Log entry synchronized.');
        });
    }
}
