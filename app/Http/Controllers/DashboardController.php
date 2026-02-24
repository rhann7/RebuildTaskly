<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\ProjectManagement\Project;
use App\Models\TaskManagement\Task;
use App\Models\Timesheet\TimesheetEntry;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $role = $user->roles->first()?->name ?? 'member';

        $stats = [];
        $activities = collect(); 
        $workspacesData = [];
        $projectsData = [];
        $tasksData = [];

        // Konfigurasi Minggu Ini (Senin - Minggu)
        $startOfWeek = Carbon::now()->startOfWeek(Carbon::MONDAY);
        $endOfWeek = Carbon::now()->endOfWeek(Carbon::SUNDAY);
        $chartData = array_fill(0, 7, 0);

        // ==========================================
        // 1. SUPER ADMIN LEVEL (Global View)
        // ==========================================
        if ($role === 'super-admin') {
            $stats = [
                ['title' => 'Companies', 'value' => Company::count(), 'change' => 'Registered', 'icon' => 'Building2', 'color' => 'from-purple-500 to-indigo-600'],
                ['title' => 'Total Users', 'value' => \App\Models\User::count(), 'change' => 'Across Platform', 'icon' => 'Users', 'color' => 'from-blue-500 to-cyan-600'],
                ['title' => 'Global Projects', 'value' => Project::count(), 'change' => 'Active Now', 'icon' => 'Briefcase', 'color' => 'from-emerald-500 to-teal-600'],
                ['title' => 'System Load', 'value' => 'Optimal', 'change' => 'Health: 100%', 'icon' => 'Activity', 'color' => 'from-emerald-500 to-teal-600'],
            ];

            $activities = Company::latest()->take(5)->get()->map(fn($c) => [
                'title' => 'New Client', 'desc' => "{$c->name} joined.", 'time' => $c->created_at->diffForHumans(), 'type' => 'system', 'timestamp' => $c->created_at
            ]);

            // Grafik Global: Total jam kerja seluruh platform
            $dailyLogs = TimesheetEntry::whereBetween('date', [$startOfWeek, $endOfWeek])
                ->selectRaw('DATE(date) as log_date, SUM(hours) as total_hours')
                ->groupBy('log_date')->pluck('total_hours', 'log_date');

        // ==========================================
        // 2. OWNER / COMPANY LEVEL (Strategic View)
        // ==========================================
        } elseif ($role === 'company' || $role === 'owner') {
            $company = $user->company ?? $user->companyOwner?->company;
            if ($company) {
                $stats = [
                    ['title' => 'Workspaces', 'value' => str_pad($company->workspaces()->count(), 2, '0', STR_PAD_LEFT), 'change' => 'Active Units', 'icon' => 'Layers', 'color' => 'from-sada-red to-red-700'],
                    ['title' => 'Team Size', 'value' => \App\Models\User::where('company_id', $company->id)->count(), 'change' => 'Members', 'icon' => 'Users', 'color' => 'from-blue-500 to-indigo-600'],
                    ['title' => 'Company Hours', 'value' => round(TimesheetEntry::whereHas('project.workspace', fn($q) => $q->where('company_id', $company->id))->whereBetween('date', [$startOfWeek, $endOfWeek])->sum('hours'), 1) . 'H', 'change' => 'Weekly Log', 'icon' => 'Clock', 'color' => 'from-emerald-500 to-teal-600'],
                    ['title' => 'Total Projects', 'value' => str_pad(Project::whereHas('workspace', fn($q) => $q->where('company_id', $company->id))->count(), 2, '0', STR_PAD_LEFT), 'change' => 'Operational', 'icon' => 'Briefcase', 'color' => 'from-orange-500 to-amber-600'],
                ];

                $workspacesData = $company->workspaces()->with(['projects.tasks', 'manager'])->get()->map(function ($ws) {
                    $allTasks = $ws->projects->flatMap->tasks;
                    $total = $allTasks->count();
                    $done = $allTasks->where('status', 'done')->count();
                    $progress = $total > 0 ? round(($done / $total) * 100) : 0;
                    return [
                        'name' => $ws->name, 'slug' => $ws->slug, 'tasks' => $total, 'completed' => $done,
                        'members' => $ws->members()->count(), 'progress' => $progress,
                        'color' => $progress > 80 ? 'bg-emerald-500' : ($progress > 40 ? 'bg-blue-500' : 'bg-sada-red'),
                        'manager' => $ws->manager?->name ?? 'Unassigned'
                    ];
                });

                $recentProjects = Project::whereHas('workspace', fn($q) => $q->where('company_id', $company->id))->latest()->take(3)->get()->map(fn($p) => [
                    'title' => 'Project Initiated', 'desc' => "{$p->name} in {$p->workspace->name}", 'time' => $p->created_at->diffForHumans(), 'type' => 'project', 'timestamp' => $p->created_at
                ]);
                $recentApprovals = TimesheetEntry::whereHas('project.workspace', fn($q) => $q->where('company_id', $company->id))->where('status', 'approved')->latest('updated_at')->take(3)->get()->map(fn($t) => [
                    'title' => 'Log Authorized', 'desc' => "{$t->user->name} - {$t->hours}H approved", 'time' => $t->updated_at->diffForHumans(), 'type' => 'approval', 'timestamp' => $t->updated_at
                ]);
                $activities = $recentProjects->merge($recentApprovals);

                $dailyLogs = TimesheetEntry::whereHas('project.workspace', fn($q) => $q->where('company_id', $company->id))
                    ->whereBetween('date', [$startOfWeek, $endOfWeek])
                    ->selectRaw('DATE(date) as log_date, SUM(hours) as total_hours')
                    ->groupBy('log_date')->pluck('total_hours', 'log_date');
            }

        // ==========================================
        // 3. MANAGER LEVEL (Tactical View)
        // ==========================================
        } elseif ($role === 'manager') {
            $managedWorkspaces = Workspace::where('manager_id', $user->id)->pluck('id');
            if ($managedWorkspaces->isNotEmpty()) {
                $stats = [
                    ['title' => 'Managed Projects', 'value' => str_pad(Project::whereIn('workspace_id', $managedWorkspaces)->count(), 2, '0', STR_PAD_LEFT), 'change' => 'Live', 'icon' => 'Briefcase', 'color' => 'from-blue-500 to-indigo-600'],
                    ['title' => 'Review Queue', 'value' => str_pad(TimesheetEntry::whereHas('project', fn($q) => $q->whereIn('workspace_id', $managedWorkspaces))->where('status', 'submitted')->count(), 2, '0', STR_PAD_LEFT), 'change' => 'Awaiting', 'icon' => 'CheckCircle', 'color' => 'from-amber-500 to-orange-600'],
                    ['title' => 'Team Hours', 'value' => round(TimesheetEntry::whereHas('project', fn($q) => $q->whereIn('workspace_id', $managedWorkspaces))->whereBetween('date', [$startOfWeek, $endOfWeek])->where('status', 'approved')->sum('hours'), 1) . 'H', 'change' => 'Approved', 'icon' => 'Clock', 'color' => 'from-emerald-500 to-teal-600'],
                    ['title' => 'Team Status', 'value' => 'Active', 'change' => 'Productive', 'icon' => 'Zap', 'color' => 'from-emerald-500 to-teal-600'],
                ];

                $projectsData = Project::whereIn('workspace_id', $managedWorkspaces)->with('workspace:id,name')->latest()->take(5)->get();
                $activities = TimesheetEntry::whereHas('project', fn($q) => $q->whereIn('workspace_id', $managedWorkspaces))
                    ->whereIn('status', ['submitted', 'revision'])->with('user')->latest('updated_at')->take(5)->get()->map(fn($t) => [
                        'title' => $t->status === 'revision' ? 'Revision Sent' : 'Log Submitted', 'desc' => "{$t->user->name}: {$t->hours}H", 'time' => $t->updated_at->diffForHumans(), 'type' => $t->status === 'revision' ? 'revision' : 'timesheet', 'timestamp' => $t->updated_at
                    ]);

                $dailyLogs = TimesheetEntry::whereHas('project', fn($q) => $q->whereIn('workspace_id', $managedWorkspaces))
                    ->whereBetween('date', [$startOfWeek, $endOfWeek])
                    ->selectRaw('DATE(date) as log_date, SUM(hours) as total_hours')
                    ->groupBy('log_date')->pluck('total_hours', 'log_date');
            }

        // ==========================================
        // 4. MEMBER LEVEL (Operational View)
        // ==========================================
        } else {
            $stats = [
                ['title' => 'My Tasks', 'value' => str_pad(Task::whereHas('project.members', fn($q) => $q->where('users.id', $user->id))->whereIn('status', ['todo', 'in_progress'])->count(), 2, '0', STR_PAD_LEFT), 'change' => 'Ongoing', 'icon' => 'CheckSquare', 'color' => 'from-indigo-500 to-blue-600'],
                ['title' => 'Logged', 'value' => round(TimesheetEntry::where('user_id', $user->id)->whereBetween('date', [$startOfWeek, $endOfWeek])->sum('hours'), 1) . 'H', 'change' => 'This Week', 'icon' => 'Clock', 'color' => 'from-emerald-500 to-teal-600'],
                ['title' => 'Revisions', 'value' => TimesheetEntry::where('user_id', $user->id)->where('status', 'revision')->count(), 'change' => 'Need Fix', 'icon' => 'ShieldAlert', 'color' => 'from-red-500 to-rose-600'],
                ['title' => 'Goal', 'value' => '40H', 'change' => 'Target', 'icon' => 'Timer', 'color' => 'from-zinc-500 to-zinc-700'],
            ];

            $tasksData = Task::whereHas('project.members', fn($q) => $q->where('users.id', $user->id))->whereIn('status', ['todo', 'in_progress'])->orderBy('due_date', 'asc')->take(5)->get();
            $activities = TimesheetEntry::where('user_id', $user->id)->latest('updated_at')->take(5)->get()->map(fn($t) => [
                'title' => strtoupper($t->status), 'desc' => "Logged {$t->hours}H", 'time' => $t->updated_at->diffForHumans(), 'type' => match($t->status){'approved'=>'approval','revision'=>'revision',default=>'timesheet'}, 'timestamp' => $t->updated_at
            ]);

            $dailyLogs = TimesheetEntry::where('user_id', $user->id)
                ->whereBetween('date', [$startOfWeek, $endOfWeek])
                ->selectRaw('DATE(date) as log_date, SUM(hours) as total_hours')
                ->groupBy('log_date')->pluck('total_hours', 'log_date');
        }

        // Mapping Data Grafik (Mapping ke 7 hari Senin-Minggu)
        if (isset($dailyLogs)) {
            for ($i = 0; $i < 7; $i++) {
                $dateKey = $startOfWeek->copy()->addDays($i)->format('Y-m-d');
                $chartData[$i] = round($dailyLogs[$dateKey] ?? 0, 1);
            }
        }

        return Inertia::render('dashboard', [
            'stats'      => $stats,
            'activities' => $activities->sortByDesc('timestamp')->values()->all(),
            'workspaces' => $workspacesData,
            'projects'   => $projectsData,
            'myTasks'    => $tasksData,
            'chartData'  => $chartData
        ]);
    }
}