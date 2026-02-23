<?php

namespace App\Http\Controllers\ProjectManagement\Projects;

use App\Http\Controllers\Controller;
use App\Models\ProjectManagement\Project;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class ProjectController extends Controller
{
    private function resolveCompany($user)
    {
        if ($user->isSuperAdmin()) return null;
        $company = $user->company ?? $user->companyOwner?->company;
        abort_if(!$company, 403, 'Anda tidak terikat dengan perusahaan manapun.');
        return $company;
    }

    private function authorizeProject($user, Project $project)
    {
        if ($user->isSuperAdmin()) return;
        $company = $this->resolveCompany($user);

        // Pastikan project terhubung ke workspace, dan workspace terhubung ke company yang benar
        abort_if(
            !$project->workspace || $project->workspace->company_id !== $company->id,
            403,
            'Akses ditolak. Project tidak terikat dengan perusahaan Anda.'
        );
    }

   public function index(Request $request, Workspace $workspace)
    {
        $user = $request->user();
        $company = $this->resolveCompany($user);

        // 1. Security check
        if (!$user->isSuperAdmin()) {
            abort_if($workspace->company_id !== $company->id, 403);
        }

        // 2. Query Projects dengan Eager Loading Tasks
        $projects = Project::query()
            ->where('workspace_id', $workspace->id)
            // Load relasi tasks untuk hitung progress di bawah
            ->with(['tasks']) 
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->status, fn($q, $s) => $q->whereIn('status', (array)$s))
            ->when($request->priority, fn($q, $p) => $q->whereIn('priority', (array)$p))
            ->latest()
            ->paginate(12) // Gue naikin ke 12 biar gridnya cakep (3 atau 4 kolom)
            ->withQueryString()
            // 3. --- JURUS SUNTIK DATA PROGRESS ---
            ->through(function ($project) {
                $totalTasks = $project->tasks->count();
                
                // Hitung task yang berstatus done
                $completedTasks = $project->tasks->filter(function($task) {
                    return $task->status === 'done';
                })->count();

                // Masukin property progress ke dalam object project
                $project->progress = $totalTasks > 0 
                    ? round(($completedTasks / $totalTasks) * 100) 
                    : 0;

                // Opsional: Kasih tau total task juga buat di card
                $project->total_tasks_count = $totalTasks;
                $project->completed_tasks_count = $completedTasks;

                return $project;
            });

        // 4. Render ke Inertia
        return Inertia::render('projects/index', [
            'workspace' => $workspace,
            'projects'  => $projects,
            'filters'   => $request->only(['search', 'status', 'priority']),
            'pageConfig' => $this->getPageConfig($request),
        ]);
    }

    public function store(Request $request, Workspace $workspace)
    {
        $user = $request->user();
        $company = $this->resolveCompany($user);

        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'description'  => 'nullable|string',
            'priority'    => 'required|in:low,medium,high', // Tambah ini
            'due_date'    => 'nullable|date',
        ]);
        if (!$user->isSuperAdmin()) {
            abort_if($workspace->company_id !== $company->id, 403);
        }

        Project::create([
            'workspace_id' => $workspace->id,
            'name'         => $validated['name'],
            'slug'         => Str::slug($validated['name']) . '-' . Str::lower(Str::random(5)),
            'description'  => $validated['description'],
            'status'       => 'active',
            'priority'     => $validated['priority'],
            'due_date'     => $validated['due_date'],
        ]);

        return redirect()
            ->route('workspaces.show', $workspace->slug)
            ->with('success', 'Project created successfully.');
    }


    public function show(Request $request, Workspace $workspace, Project $project)
    {
        abort_if($project->workspace_id !== $workspace->id, 404);
        $this->authorizeProject($request->user(), $project);

        // --- TAMBAHAN BARU: Hitung Total Task dan Progress ---
        // 1. Hitung total seluruh task di project ini
        $project->tasks_count = $project->tasks()->count();

        // 2. Hitung jumlah task yang statusnya 'done'
        $completedTasksCount = $project->tasks()->where('status', 'done')->count();

        // 3. Kalkulasi presentase
        $project->progress = $project->tasks_count > 0
            ? round(($completedTasksCount / $project->tasks_count) * 100)
            : 0;
        // -----------------------------------------------------

        // 1. Ambil Manager tunggal dari Workspace & bungkus jadi Collection biar bisa di-map
        $managers = collect();
        if ($workspace->manager) {
            $managers = collect([$workspace->manager])->map(fn($user) => [
                'id'           => $user->id,
                'name'         => $user->name,
                'email'        => $user->email,
                'project_role' => 'Workspace Manager',
                'is_manager'   => true,
            ]);
        }

        // 2. Ambil Member yang dideploy manual
        $members = $project->members()
            ->with('roles')
            ->get()
            ->map(fn($user) => [
                'id'           => $user->id,
                'name'         => $user->name,
                'email'        => $user->email,
                'project_role' => $user->pivot->project_role,
                'is_manager'   => false,
            ]);

        // 3. Gabungkan Manager & Member
        $allPersonnel = $managers->concat($members);

        // 4. Update availableEmployees (Filter biar manager gak muncul di dropdown)
        $managerId = $workspace->manager_id; // Pake ID manager langsung dari kolom DB

        $availableEmployees = $workspace->members()
            ->whereDoesntHave('projects', function ($q) use ($project) {
                $q->where('project_id', $project->id);
            })
            ->when($managerId, function ($q) use ($managerId) {
                return $q->where('users.id', '!=', $managerId);
            })
            ->get(['users.id', 'users.name', 'users.email']);

        return Inertia::render('projects/show', [
            'workspace'          => $workspace,
            'project'            => $project, // $project sekarang sudah membawa 'tasks_count' dan 'progress'
            'tasks'              => $project->tasks()->latest()->get(),
            'projectMembers'     => $allPersonnel,
            'availableEmployees' => $availableEmployees,
            'isSuperAdmin'       => $request->user()->isSuperAdmin(),
        ]);
    }

    public function update(Request $request, Workspace $workspace, Project $project)
    {
        $user = $request->user();

        // 1. CEK OTORITAS PROJECT (Pagar Utama)
        // Pastikan fungsi bawaan lo tetap jalan untuk cek relasi user ke project
        $this->authorizeProject($user, $project);

        // 2. CEK ROLE (Proteksi Akses Edit)
        // Cuma role 'company', 'owner', 'manager', atau 'super-admin' yang boleh update detail project
        if (!$user->isSuperAdmin() && !$user->hasAnyRole(['company', 'owner', 'manager'])) {
            abort(403, 'ACTION DENIED: Your clearance level is insufficient to modify project parameters.');
        }

        // 3. VALIDASI INTEGRITAS (Cek apakah project ini emang bagian dari workspace ini)
        abort_if($project->workspace_id !== $workspace->id, 404);

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'required|in:active,inactive',
            'priority'    => 'required|in:low,medium,high',
            'due_date'    => 'nullable|date',
        ]);

        // 4. EXECUTE UPDATE
        $project->update($validated);

        return back()->with('success', 'Project parameters synchronized successfully.');
    }
    public function destroy(Request $request, Workspace $workspace, Project $project)
    {
        $project->delete();

        // Setelah hapus project, balik ke halaman detail workspace-nya
        return redirect()->route('workspaces.show', $workspace->slug)
            ->with('success', 'Project removed from workspace.');
    }

    private function getPageConfig(Request $request)
    {
        $user = $request->user();
        return [
            'title' => $user->isSuperAdmin() ? 'Project Management' : 'My Projects',
            'can_manage' => $user->isSuperAdmin() || $user->hasAnyPermission(['manage-projects']),
        ];
    }

    public function globalIndex(Request $request)
    {
        $user = $request->user();
        $company = $this->resolveCompany($user);

        $projects = Project::query()
            // 1. Security & Company Scope
            ->whereHas('workspace', function ($q) use ($company, $user) {
                if (!$user->isSuperAdmin()) {
                    $q->where('company_id', $company->id);
                }
            })
            ->with('workspace:id,name,slug') // Load relation buat kolom "Sector"

            // 2. Filter Search (Nama Project)
            ->when($request->search, function ($q, $search) {
                $q->where('name', 'like', "%{$search}%");
            })

            // 3. Filter Status (Multi-select)
            ->when($request->status, function ($q, $status) {
                $q->whereIn('status', (array)$status);
            })

            // 4. Filter Priority (Multi-select)
            ->when($request->priority, function ($q, $priority) {
                $q->whereIn('priority', (array)$priority);
            })

            // 5. Filter Workspace/Sector (Multi-select)
            ->when($request->workspaces, function ($q, $workspaces) {
                $q->whereIn('workspace_id', (array)$workspaces);
            })

            ->latest()
            ->paginate(10)
            ->withQueryString();

        // Ambil daftar workspace buat bahan filter di frontend
        $workspaces = Workspace::query()
            ->when(!$user->isSuperAdmin(), fn($q) => $q->where('company_id', $company->id))
            ->get(['id', 'name']);

        return Inertia::render('projects/index', [
            'projects'   => $projects,
            'workspaces' => $workspaces, // Kirim ini biar frontend bisa nampilin list tombol workspace
            'filters'    => $request->only(['search', 'status', 'priority', 'workspaces']),
            'pageConfig' => [
                'title' => 'Global Intelligence Archive',
                'can_manage' => $user->isSuperAdmin() || ($company && $user->hasAnyPermission(['manage-projects']))
            ],
        ]);
    }

    public function addMember(Request $request, Workspace $workspace, Project $project)
    {
        $this->authorizeProject($request->user(), $project);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'project_role' => 'required|string|max:50'
        ]);

        // Security: Pastikan user yang di-invite emang anggota workspace ini
        $isWorkspaceMember = $workspace->members()->where('user_id', $validated['user_id'])->exists();
        abort_if(!$isWorkspaceMember, 403, 'User ini bukan anggota dari workspace ini.');

        // Attach ke pivot table
        $project->members()->attach($validated['user_id'], [
            'project_role' => $validated['project_role']
        ]);

        return back()->with('success', 'Personnel deployed to project successfully.');
    }

    public function removeMember(Request $request, Workspace $workspace, Project $project, $userId)
    {
        $this->authorizeProject($request->user(), $project);

        $project->members()->detach($userId);

        return back()->with('success', 'Personnel withdrawn from project.');
    }
}
