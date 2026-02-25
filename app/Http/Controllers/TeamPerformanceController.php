<?php

namespace App\Http\Controllers;

use App\Models\ProjectManagement\Project;
use App\Models\TaskManagement\Task;
use App\Models\User;
use App\Models\Workspace;
use App\Models\Timesheet\TimesheetEntry;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeamPerformanceController extends Controller
{
    // ─── Auth Helper ──────────────────────────────────────────────────────────
    private function resolveCompany($user)
    {
        if ($user->isSuperAdmin()) return null;
        $company = $user->company ?? $user->companyOwner?->company;
        abort_if(!$company, 403, 'No company bound.');
        return $company;
    }

    // ─── Index ────────────────────────────────────────────────────────────────
    public function index(Request $request, Workspace $workspace)
    {
        $user = $request->user();
        $company = $this->resolveCompany($user);

        // Guard: Only workspace manager / super-admin
        if (!$user->isSuperAdmin()) {
            $isManager = $workspace->manager_id === $user->id;
            abort_if(!$isManager && !$user->hasAnyRole(['company', 'owner', 'manager']), 403, 'Managers only.');
            abort_if($workspace->company_id !== $company->id, 403);
        }

        $filters = [
            'project_id' => $request->get('project_id', 'all'),
            'period'     => $request->get('period', 'week'),
            'date_from'  => $request->get('date_from'),
            'date_to'    => $request->get('date_to'),
        ];

        $dateRange = $this->getDateRange($filters['period'], $filters['date_from'], $filters['date_to']);

        $projects = Project::where('workspace_id', $workspace->id)->get(['id', 'name', 'slug']);

        $dashboardData = [
            'teamSummary'          => $this->getTeamSummary($workspace, $filters),
            'taskOverviewStats'    => $this->getTaskOverviewStats($workspace, $filters),
            'productivityMetrics'  => $this->getProductivityMetrics($workspace, $filters, $dateRange),
            'workloadDistribution' => $this->getWorkloadDistribution($workspace, $filters),
            'teamLeaderboard'      => $this->getTeamLeaderboard($workspace, $filters, $dateRange),
            'criticalAlerts'       => $this->getCriticalAlerts($workspace, $filters, $dateRange),
            'memberDetails'        => $this->getAllMemberDetails($workspace, $filters, $dateRange),
            'productivityTrends'   => $this->getProductivityTrends($workspace, $filters),
            // --- TAMBAHAN BARU: Kirim log aktivitas seluruh Workspace ---
            'recentActivities'     => $this->getRecentActivities($workspace, null, $filters),
        ];

        return Inertia::render('team-performance/index', [
            'workspace'     => $workspace->only('id', 'name', 'slug'),
            'dashboardData' => $dashboardData,
            'projects'      => $projects,
            'filters'       => $filters,
            'isManager'     => $user->isSuperAdmin() || $workspace->manager_id === $user->id,
        ]);
    }

    // ─── Show Member ──────────────────────────────────────────────────────────
    public function showMember(Request $request, Workspace $workspace, User $member)
    {
        $user = $request->user();
        $company = $this->resolveCompany($user);

        if (!$user->isSuperAdmin()) {
            abort_if($workspace->company_id !== $company->id, 403);
            $isManager = $workspace->manager_id === $user->id;
            abort_if(!$isManager && !$user->hasAnyRole(['company', 'owner', 'manager']), 403, 'Managers only.');
        }

        $isMember = $workspace->members()->where('users.id', $member->id)->exists()
            || $workspace->manager_id === $member->id;
        abort_if(!$isMember, 404, 'Member not found in workspace.');

        $filters = [
            'project_id' => $request->get('project_id', 'all'),
            'period'     => $request->get('period', 'week'),
            'date_from'  => $request->get('date_from'),
            'date_to'    => $request->get('date_to'),
        ];

        $dateRange = $this->getDateRange($filters['period'], $filters['date_from'], $filters['date_to']);

        $projects = Project::where('workspace_id', $workspace->id)->get(['id', 'name', 'slug']);
        $memberData = $this->getMemberComprehensiveStats($workspace, $member, $filters, $dateRange);

        return Inertia::render('team-performance/member', [
            'workspace'          => $workspace->only('id', 'name', 'slug'),
            'member'             => $memberData['member'],
            'recentTasks'        => $memberData['recentTasks'],
            'performanceHistory' => $memberData['performanceHistory'],
            'projects'           => $projects,
            'filters'            => $filters,
            // --- TAMBAHAN BARU: Kirim log aktivitas khusus member ini ---
            'recentActivities'   => $this->getRecentActivities($workspace, $member, $filters),
        ]);
    }

    // ─── TAMBAHAN BARU: Fungsi Pembuat Activity Log ───────────────────────────
    private function getRecentActivities(Workspace $workspace, ?User $member = null, array $filters = []): array
    {
        try {
            // 1. Tarik Task Terbaru (Yang diupdate atau Selesai)
            $tasksQuery = $this->baseTaskQuery($workspace, $filters);

            if ($member) {
                $tasksQuery->join('task_user', 'tasks.id', '=', 'task_user.task_id')
                    ->where('task_user.user_id', $member->id)
                    ->select('tasks.*');
            }

            $recentTasks = (clone $tasksQuery)->with('project:id,name')->latest('updated_at')->take(5)->get()->map(function ($t) use ($member) {
                $isDone = $t->status === 'done';
                return [
                    'id'          => 'task-' . $t->id,
                    'title'       => $isDone ? 'Task Completed' : 'Task Status Updated',
                    'description' => "{$t->title} in {$t->project->name} is now {$t->status}.",
                    'type'        => $isDone ? 'completed' : 'status',
                    'time'        => $t->updated_at, // Biarkan Carbon object untuk sorting nanti
                    'time_human'  => $t->updated_at->diffForHumans(),
                    'user'        => $member ? $member->name : 'System'
                ];
            });

            // 2. Tarik Timesheet (Log Jam Kerja) Terbaru
            $tsQuery = TimesheetEntry::whereHas('task', function ($q) use ($workspace, $filters) {
                $q->whereHas('project', function ($pq) use ($workspace, $filters) {
                    $pq->where('workspace_id', $workspace->id);
                    if (!empty($filters['project_id']) && $filters['project_id'] !== 'all') {
                        $pq->where('id', $filters['project_id']);
                    }
                });
            });

            if ($member) {
                $tsQuery->where('user_id', $member->id);
            }

            $recentTimesheets = (clone $tsQuery)->with('user:id,name')->latest('updated_at')->take(5)->get()->map(function ($ts) {
                return [
                    'id'          => 'ts-' . $ts->id,
                    'title'       => 'Timesheet Logged',
                    'description' => "{$ts->user->name} logged {$ts->hours}h on task.",
                    'type'        => 'timesheet',
                    'time'        => $ts->updated_at,
                    'time_human'  => $ts->updated_at->diffForHumans(),
                    'user'        => $ts->user->name,
                ];
            });

            // Gabungkan, Urutkan berdasarkan waktu terbaru, lalu ambil top 10
            return collect($recentTasks)
                ->merge($recentTimesheets)
                ->sortByDesc('time') // Sort pakai object Carbon
                ->take(10)
                ->map(function ($item) {
                    $item['time'] = $item['time']->toIso8601String(); // Ubah ke string sebelum dilempar ke React
                    return $item;
                })
                ->values()
                ->toArray();
        } catch (\Exception $e) {
            \Log::error('Activities error: ' . $e->getMessage());
            return [];
        }
    }

    // ─── Helper Functions di Bawah Sini Tetap Sama Persis ─────────────────────
    private function getDateRange($period, $dateFrom = null, $dateTo = null): array
    {
        return match ($period) {
            'today'  => ['start' => now()->startOfDay(),   'end' => now()->endOfDay()],
            'month'  => ['start' => now()->startOfMonth(), 'end' => now()->endOfMonth()],
            'custom' => [
                'start' => $dateFrom ? Carbon::parse($dateFrom)->startOfDay() : now()->startOfMonth(),
                'end'   => $dateTo   ? Carbon::parse($dateTo)->endOfDay()     : now()->endOfDay(),
            ],
            default  => ['start' => now()->startOfWeek(), 'end' => now()->endOfWeek()],
        };
    }

    private function baseTaskQuery(Workspace $workspace, array $filters)
    {
        return Task::whereHas('project', function ($q) use ($workspace, $filters) {
            $q->where('workspace_id', $workspace->id);
            if (!empty($filters['project_id']) && $filters['project_id'] !== 'all') {
                $q->where('id', $filters['project_id']);
            }
        });
    }

    // ─── Team Summary ─────────────────────────────────────────────────────────
    private function getTeamSummary(Workspace $workspace, array $filters): array
    {
        try {
            // All users in this workspace (members + manager)
            $memberIds = $workspace->members()->pluck('users.id')->toArray();
            if ($workspace->manager_id) {
                $memberIds[] = $workspace->manager_id;
            }
            $memberIds = array_unique($memberIds);
            $totalMembers = count($memberIds);

            if ($totalMembers === 0) {
                return ['totalMembers' => 0, 'managers' => 1, 'activeMembers' => 0, 'unassigned' => 0, 'avgUtilization' => 0];
            }

            // Members who have at least one task
            $assignedUserIds = (clone $this->baseTaskQuery($workspace, $filters))
                ->join('task_user', 'tasks.id', '=', 'task_user.task_id')
                ->distinct()
                ->pluck('task_user.user_id')
                ->toArray();

            $activeMembers   = count($assignedUserIds);
            $unassigned      = max(0, $totalMembers - $activeMembers);
            $managerCount    = 1; // workspace manager

            return [
                'totalMembers'   => $totalMembers,
                'managers'       => $managerCount,
                'activeMembers'  => $activeMembers,
                'unassigned'     => $unassigned,
                'avgUtilization' => $totalMembers > 0 ? round(($activeMembers / $totalMembers) * 100, 1) : 0,
            ];
        } catch (\Exception $e) {
            \Log::error('Team summary error: ' . $e->getMessage());
            return ['totalMembers' => 0, 'managers' => 0, 'activeMembers' => 0, 'unassigned' => 0, 'avgUtilization' => 0];
        }
    }

    // ─── Task Overview Stats ──────────────────────────────────────────────────
    private function getTaskOverviewStats(Workspace $workspace, array $filters): array
    {
        try {
            $base = $this->baseTaskQuery($workspace, $filters);

            $total      = (clone $base)->count();
            $todo       = (clone $base)->where('status', 'todo')->count();
            $inProgress = (clone $base)->where('status', 'in_progress')->count();
            $review     = (clone $base)->where('status', 'review')->count();
            $revision   = (clone $base)->where('status', 'revision')->count();
            $done       = (clone $base)->where('status', 'done')->count();
            $overdue    = (clone $base)->whereNotIn('status', ['done'])->where('due_date', '<', now())->count();

            return [
                'total'          => $total,
                'todo'           => $todo,
                'in_progress'    => $inProgress,
                'review'         => $review,
                'revision'       => $revision,
                'done'           => $done,
                'overdue'        => $overdue,
                'completionRate' => $total > 0 ? round(($done / $total) * 100, 1) : 0,
            ];
        } catch (\Exception $e) {
            \Log::error('Task overview stats error: ' . $e->getMessage());
            return ['total' => 0, 'todo' => 0, 'in_progress' => 0, 'review' => 0, 'revision' => 0, 'done' => 0, 'overdue' => 0, 'completionRate' => 0];
        }
    }

    // ─── Productivity Metrics ─────────────────────────────────────────────────
    private function getProductivityMetrics(Workspace $workspace, array $filters, array $dateRange): array
    {
        try {
            $mode = $filters['period'] ?? 'week';

            $currentStart = $dateRange['start'];
            $currentEnd   = $dateRange['end'];

            $periodLength  = max(1, $currentStart->diffInDays($currentEnd) + 1);
            $previousStart = $currentStart->copy()->subDays($periodLength);
            $previousEnd   = $currentEnd->copy()->subDays($periodLength);

            $doneBase = fn() => $this->baseTaskQuery($workspace, $filters)->where('status', 'done');

            $completedCurrent  = (clone $doneBase())->whereBetween('updated_at', [$currentStart, $currentEnd])->count();
            $completedPrevious = (clone $doneBase())->whereBetween('updated_at', [$previousStart, $previousEnd])->count();

            // Hours from timesheet
            $hoursBase = fn() => TimesheetEntry::whereHas('task', function ($q) use ($workspace, $filters) {
                $q->whereHas('project', function ($pq) use ($workspace, $filters) {
                    $pq->where('workspace_id', $workspace->id);
                    if (!empty($filters['project_id']) && $filters['project_id'] !== 'all') {
                        $pq->where('id', $filters['project_id']);
                    }
                });
            });

            $hoursCurrent  = (clone $hoursBase())->whereBetween('date', [$currentStart, $currentEnd])->sum('hours') ?? 0;
            $hoursPrevious = (clone $hoursBase())->whereBetween('date', [$previousStart, $previousEnd])->sum('hours') ?? 0;

            $taskChange   = $completedPrevious > 0 ? round((($completedCurrent - $completedPrevious) / $completedPrevious) * 100, 1) : ($completedCurrent > 0 ? 100 : 0);
            $hoursChange  = $hoursPrevious > 0 ? round((($hoursCurrent - $hoursPrevious) / $hoursPrevious) * 100, 1) : 0;

            return [
                'completedCurrent'  => $completedCurrent,
                'completedPrevious' => $completedPrevious,
                'hoursCurrent'      => round($hoursCurrent, 1),
                'hoursPrevious'     => round($hoursPrevious, 1),
                'taskChange'        => $taskChange,
                'hoursChange'       => $hoursChange,
                'trend'             => $taskChange > 0 ? 'up' : ($taskChange < 0 ? 'down' : 'stable'),
                'mode'              => $mode,
            ];
        } catch (\Exception $e) {
            \Log::error('Productivity metrics error: ' . $e->getMessage());
            return ['completedCurrent' => 0, 'completedPrevious' => 0, 'hoursCurrent' => 0, 'hoursPrevious' => 0, 'taskChange' => 0, 'hoursChange' => 0, 'trend' => 'stable', 'mode' => 'week'];
        }
    }

    // ─── Workload per member ───────────────────────────────────────────────────
    private function calculateMemberWorkload(User $member, Workspace $workspace, array $filters): array
    {
        $activeTasks = $this->baseTaskQuery($workspace, $filters)
            ->whereNotIn('status', ['done'])
            ->join('task_user', 'tasks.id', '=', 'task_user.task_id')
            ->where('task_user.user_id', $member->id)
            ->select('tasks.*')
            ->get();

        $score = $activeTasks->sum(function ($task) {
            return match ($task->priority) {
                'high'   => 3.0,
                'medium' => 1.5,
                default  => 1.0,
            };
        });

        $percentage = min(round(($score / 15) * 100, 1), 200); // 15 score = 100%
        $status = $percentage > 120 ? 'overloaded' : ($percentage < 40 ? 'underutilized' : 'normal');

        return ['taskCount' => $activeTasks->count(), 'totalScore' => round($score, 1), 'percentage' => $percentage, 'status' => $status];
    }

    // ─── Workload Distribution ────────────────────────────────────────────────
    private function getWorkloadDistribution(Workspace $workspace, array $filters): array
    {
        try {
            $members = $this->getWorkspaceUsers($workspace);
            if ($members->isEmpty()) return ['members' => [], 'overloadedCount' => 0, 'underutilizedCount' => 0, 'needsRebalancing' => false];

            $distribution       = [];
            $overloadedCount    = 0;
            $underutilizedCount = 0;

            foreach ($members as $member) {
                $w = $this->calculateMemberWorkload($member, $workspace, $filters);
                if ($w['status'] === 'overloaded') $overloadedCount++;
                if ($w['status'] === 'underutilized') $underutilizedCount++;
                $distribution[] = ['id' => $member->id, 'name' => $member->name, 'avatar' => $member->profile_photo_url ?? null, ...$w];
            }

            usort($distribution, fn($a, $b) => $b['percentage'] <=> $a['percentage']);

            return ['members' => $distribution, 'overloadedCount' => $overloadedCount, 'underutilizedCount' => $underutilizedCount, 'needsRebalancing' => $overloadedCount > 0 || $underutilizedCount > 1];
        } catch (\Exception $e) {
            \Log::error('Workload distribution error: ' . $e->getMessage());
            return ['members' => [], 'overloadedCount' => 0, 'underutilizedCount' => 0, 'needsRebalancing' => false];
        }
    }

    // ─── Team Leaderboard ─────────────────────────────────────────────────────
    private function getTeamLeaderboard(Workspace $workspace, array $filters, array $dateRange): array
    {
        try {
            $members   = $this->getWorkspaceUsers($workspace);
            $periodStart = $dateRange['start'];
            $periodEnd   = $dateRange['end'];

            $leaderboard = $members->map(function ($member) use ($workspace, $filters, $periodStart, $periodEnd) {
                $doneTasks = $this->baseTaskQuery($workspace, $filters)
                    ->where('status', 'done')
                    ->join('task_user', 'tasks.id', '=', 'task_user.task_id')
                    ->where('task_user.user_id', $member->id)
                    ->whereBetween('tasks.updated_at', [$periodStart, $periodEnd])
                    ->select('tasks.*')
                    ->get();

                $onTime = $doneTasks->filter(fn($t) => !$t->due_date || $t->updated_at <= $t->due_date)->count();

                // Points: high=3, medium=2, low=1
                $points = $doneTasks->sum(fn($t) => match ($t->priority) {
                    'high' => 3,
                    'medium' => 2,
                    default => 1
                });

                return [
                    'id'             => $member->id,
                    'name'           => $member->name,
                    'avatar'         => $member->profile_photo_url ?? null,
                    'tasksCompleted' => $doneTasks->count(),
                    'points'         => $points,
                    'onTimeRate'     => $doneTasks->count() > 0 ? round(($onTime / $doneTasks->count()) * 100, 1) : 0,
                ];
            })->sortByDesc('points')->values()->map(function ($m, $i) {
                return [...$m, 'rank' => $i + 1];
            })->toArray();

            return $leaderboard;
        } catch (\Exception $e) {
            \Log::error('Leaderboard error: ' . $e->getMessage());
            return [];
        }
    }

    // ─── Critical Alerts ──────────────────────────────────────────────────────
    private function getCriticalAlerts(Workspace $workspace, array $filters, array $dateRange): array
    {
        try {
            $alerts = ['urgent' => [], 'warnings' => []];

            // Overdue tasks
            $overdueCount = $this->baseTaskQuery($workspace, $filters)
                ->whereNotIn('status', ['done'])
                ->where('due_date', '<', now())
                ->count();

            if ($overdueCount > 0) {
                $alerts['urgent'][] = ['type' => 'overdue_tasks', 'message' => "{$overdueCount} task(s) are overdue", 'count' => $overdueCount];
            }

            // Tasks stuck in review > 3 days
            $stuckReview = $this->baseTaskQuery($workspace, $filters)
                ->where('status', 'review')
                ->where('updated_at', '<', now()->subDays(3))
                ->count();

            if ($stuckReview > 0) {
                $alerts['warnings'][] = ['type' => 'stuck_review', 'message' => "{$stuckReview} task(s) stuck in review for >3 days", 'count' => $stuckReview];
            }

            // Tasks needing revision
            $revisionCount = $this->baseTaskQuery($workspace, $filters)
                ->where('status', 'revision')
                ->count();

            if ($revisionCount > 0) {
                $alerts['warnings'][] = ['type' => 'revision_needed', 'message' => "{$revisionCount} task(s) need revision", 'count' => $revisionCount];
            }

            // Overloaded members
            $members = $this->getWorkspaceUsers($workspace);
            $overloaded = [];
            $underutilized = [];

            foreach ($members as $member) {
                $w = $this->calculateMemberWorkload($member, $workspace, $filters);
                if ($w['status'] === 'overloaded') $overloaded[] = $member->name;
                if ($w['status'] === 'underutilized') $underutilized[] = $member->name;
            }

            if (count($overloaded) > 0) {
                $names = implode(', ', array_slice($overloaded, 0, 2));
                $alerts['urgent'][] = ['type' => 'overloaded_members', 'message' => "{$names} overloaded (high task score)", 'count' => count($overloaded)];
            }

            if (count($underutilized) > 1) {
                $names = implode(', ', array_slice($underutilized, 0, 2));
                $alerts['warnings'][] = ['type' => 'underutilized_members', 'message' => "{$names} underutilized", 'count' => count($underutilized)];
            }

            return $alerts;
        } catch (\Exception $e) {
            \Log::error('Critical alerts error: ' . $e->getMessage());
            return ['urgent' => [], 'warnings' => []];
        }
    }

    // ─── All Member Details ───────────────────────────────────────────────────
    private function getAllMemberDetails(Workspace $workspace, array $filters, array $dateRange): array
    {
        try {
            return $this->getWorkspaceUsers($workspace)
                ->map(fn($m) => $this->getMemberDetailedStats($workspace, $m, $filters, $dateRange))
                ->toArray();
        } catch (\Exception $e) {
            \Log::error('All member details error: ' . $e->getMessage());
            return [];
        }
    }

    private function getMemberDetailedStats(Workspace $workspace, User $member, array $filters, array $dateRange): array
    {
        try {
            $allTasks = $this->baseTaskQuery($workspace, $filters)
                ->join('task_user', 'tasks.id', '=', 'task_user.task_id')
                ->where('task_user.user_id', $member->id)
                ->select('tasks.*')
                ->get();

            $activeTasks = $allTasks->whereNotIn('status', ['done']);

            $donePeriod = $allTasks->where('status', 'done')
                ->whereBetween('updated_at', [$dateRange['start'], $dateRange['end']]);

            $onTime       = $donePeriod->filter(fn($t) => !$t->due_date || $t->updated_at <= $t->due_date)->count();
            $compRate     = $donePeriod->count() > 0 ? round(($onTime / $donePeriod->count()) * 100, 1) : 0;
            $points       = $donePeriod->sum(fn($t) => match ($t->priority) {
                'high' => 3,
                'medium' => 2,
                default => 1
            });

            $hoursWeek = TimesheetEntry::whereHas('task', function ($q) use ($workspace, $filters) {
                $q->whereHas('project', function ($pq) use ($workspace, $filters) {
                    $pq->where('workspace_id', $workspace->id);
                    if (!empty($filters['project_id']) && $filters['project_id'] !== 'all') {
                        $pq->where('id', $filters['project_id']);
                    }
                });
            })->where('user_id', $member->id)
                ->whereBetween('date', [now()->startOfWeek(), now()->endOfWeek()])
                ->sum('hours') ?? 0;

            // Daily breakdown (Mon–Sun current week)
            $dailyBreakdown = [];
            for ($i = 0; $i < 7; $i++) {
                $day = now()->startOfWeek()->addDays($i);
                $h = TimesheetEntry::where('user_id', $member->id)
                    ->whereDate('date', $day)
                    ->sum('hours') ?? 0;
                $dailyBreakdown[] = ['day' => $day->format('D'), 'hours' => round($h, 1), 'overtime' => $h > 9];
            }

            $alerts = [];
            $overdue = $activeTasks->where('due_date', '<', now()->toDateString())->count();
            if ($overdue > 0) $alerts[] = ['type' => 'urgent', 'message' => "{$overdue} overdue task(s)"];
            if ($activeTasks->count() > 12) $alerts[] = ['type' => 'urgent', 'message' => "Overloaded ({$activeTasks->count()} active tasks)"];

            $role = $workspace->manager_id === $member->id ? 'manager' : 'member';

            return [
                'id'     => $member->id,
                'name'   => $member->name,
                'email'  => $member->email,
                'avatar' => $member->profile_photo_url ?? null,
                'role'   => $role,
                'taskSummary' => [
                    'total'       => $activeTasks->count(),
                    'todo'        => $activeTasks->where('status', 'todo')->count(),
                    'in_progress' => $activeTasks->where('status', 'in_progress')->count(),
                    'review'      => $activeTasks->where('status', 'review')->count(),
                    'revision'    => $activeTasks->where('status', 'revision')->count(),
                    'doneThisWeek' => $allTasks->where('status', 'done')->where('updated_at', '>=', now()->startOfWeek())->count(),
                    'overdue'     => $overdue,
                    'byPriority'  => [
                        'high'   => $activeTasks->where('priority', 'high')->count(),
                        'medium' => $activeTasks->where('priority', 'medium')->count(),
                        'low'    => $activeTasks->where('priority', 'low')->count(),
                    ],
                ],
                'performance' => [
                    'completionRate'  => $compRate,
                    'tasksCompleted'  => $donePeriod->count(),
                    'pointsEarned'    => $points,
                ],
                'timeTracking' => [
                    'thisWeek'       => round($hoursWeek, 1),
                    'dailyBreakdown' => $dailyBreakdown,
                ],
                'alerts' => $alerts,
            ];
        } catch (\Exception $e) {
            \Log::error('Member detail stats error: ' . $e->getMessage());
            return ['id' => $member->id, 'name' => $member->name, 'email' => $member->email, 'role' => 'member', 'taskSummary' => [], 'performance' => [], 'timeTracking' => [], 'alerts' => []];
        }
    }

    // ─── Productivity Trends ──────────────────────────────────────────────────
    private function getProductivityTrends(Workspace $workspace, array $filters): array
    {
        try {
            $period = $filters['period'] ?? 'week';
            $points = fn($tasks) => $tasks->sum(fn($t) => match ($t->priority) {
                'high' => 3,
                'medium' => 2,
                default => 1
            });

            if ($period === 'today') {
                return collect(range(0, 7))->map(function ($i) use ($workspace, $filters, $points) {
                    $s = now()->startOfDay()->addHours($i * 3);
                    $e = $s->copy()->addHours(3);
                    $tasks = (clone $this->baseTaskQuery($workspace, $filters))->where('status', 'done')->whereBetween('updated_at', [$s, $e])->get();
                    return ['week' => $s->format('H:i'), 'tasksCompleted' => $tasks->count(), 'pointsEarned' => $points($tasks)];
                })->toArray();
            }

            if ($period === 'month') {
                return collect(range(0, 3))->map(function ($i) use ($workspace, $filters, $points) {
                    $s = now()->startOfMonth()->addWeeks($i);
                    $e = $s->copy()->addWeek()->subSecond();
                    if ($e > now()->endOfMonth()) $e = now()->endOfMonth();
                    $tasks = (clone $this->baseTaskQuery($workspace, $filters))->where('status', 'done')->whereBetween('updated_at', [$s, $e])->get();
                    return ['week' => 'Week ' . ($i + 1), 'tasksCompleted' => $tasks->count(), 'pointsEarned' => $points($tasks)];
                })->toArray();
            }

            // Default: daily for current week (7 days)
            return collect(range(0, 6))->map(function ($i) use ($workspace, $filters, $points) {
                $day = now()->startOfWeek()->addDays($i);
                $tasks = (clone $this->baseTaskQuery($workspace, $filters))->where('status', 'done')
                    ->whereDate('updated_at', $day)->get();
                return ['week' => $day->format('D M j'), 'tasksCompleted' => $tasks->count(), 'pointsEarned' => $points($tasks)];
            })->toArray();
        } catch (\Exception $e) {
            \Log::error('Productivity trends error: ' . $e->getMessage());
            return [];
        }
    }

    // ─── Member Comprehensive Stats ───────────────────────────────────────────
    private function getMemberComprehensiveStats(Workspace $workspace, User $member, array $filters, array $dateRange): array
    {
        try {
            $allTasks = $this->baseTaskQuery($workspace, $filters)
                ->join('task_user', 'tasks.id', '=', 'task_user.task_id')
                ->where('task_user.user_id', $member->id)
                ->select('tasks.*')
                ->with(['project'])
                ->get();

            $activeTasks = $allTasks->whereNotIn('status', ['done']);
            $donePeriod  = $allTasks->where('status', 'done')
                ->whereBetween('updated_at', [$dateRange['start'], $dateRange['end']]);

            $onTime   = $donePeriod->filter(fn($t) => !$t->due_date || $t->updated_at <= $t->due_date)->count();
            $compRate = $donePeriod->count() > 0 ? round(($onTime / $donePeriod->count()) * 100, 1) : 0;
            $points   = $donePeriod->sum(fn($t) => match ($t->priority) {
                'high' => 3,
                'medium' => 2,
                default => 1
            });

            // Time tracking
            $daysInPeriod = max(1, $dateRange['start']->diffInDays($dateRange['end']) + 1);
            $granularity  = $daysInPeriod > 14 ? 'weekly' : 'daily';

            $hoursTotal = TimesheetEntry::where('user_id', $member->id)
                ->whereBetween('date', [$dateRange['start'], $dateRange['end']])
                ->sum('hours') ?? 0;

            // Build breakdown
            $breakdown = [];
            $cursor = $dateRange['start']->copy();

            if ($granularity === 'weekly') {
                while ($cursor <= $dateRange['end']) {
                    $weekEnd = min($cursor->copy()->endOfWeek(), $dateRange['end']);
                    $h = TimesheetEntry::where('user_id', $member->id)->whereBetween('date', [$cursor, $weekEnd])->sum('hours') ?? 0;
                    $breakdown[] = ['period' => $cursor->format('M j') . '-' . $weekEnd->format('M j'), 'hours' => round($h, 1), 'overtime' => $h > 40, 'target' => 40];
                    $cursor = $weekEnd->copy()->addDay();
                }
            } else {
                while ($cursor <= $dateRange['end']) {
                    $h = TimesheetEntry::where('user_id', $member->id)->whereDate('date', $cursor)->sum('hours') ?? 0;
                    $breakdown[] = ['period' => $cursor->format('D M j'), 'hours' => round($h, 1), 'overtime' => $h > 9, 'target' => 8];
                    $cursor->addDay();
                }
            }

            // Daily breakdown for card display
            $dailyBreakdown = [];
            for ($i = 0; $i < 7; $i++) {
                $day = now()->startOfWeek()->addDays($i);
                $h = TimesheetEntry::where('user_id', $member->id)->whereDate('date', $day)->sum('hours') ?? 0;
                $dailyBreakdown[] = ['day' => $day->format('D'), 'hours' => round($h, 1), 'overtime' => $h > 9];
            }

            // Alerts
            $overdue = $activeTasks->where('due_date', '<', now()->toDateString())->count();
            $alerts  = [];
            if ($overdue > 0) $alerts[] = ['type' => 'urgent', 'message' => "{$overdue} overdue task(s)"];
            if ($activeTasks->count() > 12) $alerts[] = ['type' => 'urgent', 'message' => "Overloaded ({$activeTasks->count()} active tasks)"];

            // Recent tasks
            $recentTasks = $allTasks->whereBetween('updated_at', [$dateRange['start'], $dateRange['end']])
                ->sortByDesc('updated_at')->take(10)
                ->map(fn($t) => [
                    'id'       => $t->id,
                    'title'    => $t->title,
                    'status'   => $t->status,
                    'priority' => $t->priority,
                    'due_date' => $t->due_date?->format('Y-m-d'),
                    'project'  => $t->project ? ['name' => $t->project->name] : null,
                ])->values()->toArray();

            // Performance history
            $performanceHistory = $this->getMemberPerformanceHistory($workspace, $member, $filters['period'], $dateRange);

            $role = $workspace->manager_id === $member->id ? 'manager' : 'member';

            return [
                'member' => [
                    'id'     => $member->id,
                    'name'   => $member->name,
                    'email'  => $member->email,
                    'avatar' => $member->profile_photo_url ?? null,
                    'role'   => $role,
                    'taskSummary' => [
                        'total'       => $activeTasks->count(),
                        'todo'        => $activeTasks->where('status', 'todo')->count(),
                        'in_progress' => $activeTasks->where('status', 'in_progress')->count(),
                        'review'      => $activeTasks->where('status', 'review')->count(),
                        'revision'    => $activeTasks->where('status', 'revision')->count(),
                        'doneThisWeek' => $allTasks->where('status', 'done')->where('updated_at', '>=', now()->startOfWeek())->count(),
                        'overdue'     => $overdue,
                        'byPriority'  => [
                            'high'   => $activeTasks->where('priority', 'high')->count(),
                            'medium' => $activeTasks->where('priority', 'medium')->count(),
                            'low'    => $activeTasks->where('priority', 'low')->count(),
                        ],
                    ],
                    'performance' => [
                        'completionRate' => $compRate,
                        'tasksCompleted' => $donePeriod->count(),
                        'pointsEarned'   => $points,
                    ],
                    'timeTracking' => [
                        'thisWeek'       => round($hoursTotal, 1),
                        'totalHours'     => round($hoursTotal, 1),
                        'granularity'    => $granularity,
                        'breakdown'      => $breakdown,
                        'dailyBreakdown' => $dailyBreakdown,
                        'avgPerPeriod'   => count($breakdown) > 0 ? round($hoursTotal / count($breakdown), 1) : 0,
                        'overtimeCount'  => collect($breakdown)->where('overtime', true)->count(),
                    ],
                    'alerts' => $alerts,
                ],
                'recentTasks'        => $recentTasks,
                'performanceHistory' => $performanceHistory,
            ];
        } catch (\Exception $e) {
            \Log::error('Member comprehensive stats error: ' . $e->getMessage());
            return ['member' => ['id' => $member->id, 'name' => $member->name, 'alerts' => [], 'taskSummary' => [], 'performance' => [], 'timeTracking' => []], 'recentTasks' => [], 'performanceHistory' => []];
        }
    }

    private function getMemberPerformanceHistory(Workspace $workspace, User $member, string $period, array $dateRange): array
    {
        $points = fn($tasks) => $tasks->sum(fn($t) => match ($t->priority) {
            'high' => 3,
            'medium' => 2,
            default => 1
        });

        $getPoint = function ($s, $e, $label) use ($workspace, $member, $points) {
            $tasks = $this->baseTaskQuery($workspace, [])
                ->where('status', 'done')
                ->join('task_user', 'tasks.id', '=', 'task_user.task_id')
                ->where('task_user.user_id', $member->id)
                ->whereBetween('tasks.updated_at', [$s, $e])
                ->select('tasks.*')
                ->get();
            $h = TimesheetEntry::where('user_id', $member->id)->whereBetween('date', [$s, $e])->sum('hours') ?? 0;
            return ['week' => $label, 'tasksCompleted' => $tasks->count(), 'pointsEarned' => $points($tasks), 'hoursTracked' => round($h, 1)];
        };

        if ($period === 'week') {
            return collect(range(0, 6))->map(function ($i) use ($dateRange, $getPoint) {
                $d = $dateRange['start']->copy()->addDays($i);
                return $getPoint($d->copy()->startOfDay(), $d->copy()->endOfDay(), $d->format('D M j'));
            })->toArray();
        }

        if ($period === 'month') {
            return collect(range(0, 3))->map(function ($i) use ($dateRange, $getPoint) {
                $s = $dateRange['start']->copy()->addWeeks($i);
                $e = $s->copy()->addWeek()->subSecond();
                return $getPoint($s, $e, 'Week ' . ($i + 1));
            })->toArray();
        }

        // Default: last 8 weeks
        return collect(range(7, 0))->map(function ($i) use ($getPoint) {
            $s = now()->subWeeks($i)->startOfWeek();
            $e = now()->subWeeks($i)->endOfWeek();
            return $getPoint($s, $e, $s->format('M d'));
        })->toArray();
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────
    private function getWorkspaceUsers(Workspace $workspace)
    {
        $members = $workspace->members()->get();
        if ($workspace->manager_id) {
            $manager = User::find($workspace->manager_id);
            if ($manager && !$members->contains('id', $manager->id)) {
                $members = $members->push($manager);
            }
        }
        return $members;
    }
}
