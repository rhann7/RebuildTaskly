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

        // Security check: Pastikan user tidak bisa intip workspace milik company lain via URL
        if (!$user->isSuperAdmin()) {
            abort_if($workspace->company_id !== $company->id, 403);
        }

        $projects = Project::query()
            ->where('workspace_id', $workspace->id)
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            // Pake whereIn karena datanya berupa array
            ->when($request->status, fn($q, $s) => $q->whereIn('status', (array)$s))
            ->when($request->priority, fn($q, $p) => $q->whereIn('priority', (array)$p))
            ->latest()
            ->paginate(10)
            ->withQueryString();

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

        // 1. Ambil member yang sudah join di project ini
        $projectMembers = $project->members()
            ->with('roles')
            ->get()
            ->map(fn($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'project_role' => $user->pivot->project_role,
            ]);

        // 2. Ambil karyawan yang ada di Workspace ini tapi BELUM join di project ini
        // Kita filter pake whereDoesntHave biar dropdown-nya bersih
        $availableEmployees = $workspace->members()
            ->whereDoesntHave('projects', function($q) use ($project) {
                $q->where('project_id', $project->id);
            })
            ->get(['users.id', 'users.name', 'users.email']);

        return Inertia::render('projects/show', [
            'workspace' => $workspace,
            'project' => $project,
            'tasks' => $project->tasks()->latest()->get(),
            'projectMembers' => $projectMembers,
            'availableEmployees' => $availableEmployees,
            'isSuperAdmin' => $request->user()->isSuperAdmin(),
        ]);
    }


    public function update(Request $request, Workspace $workspace, Project $project)
    {
        $this->authorizeProject($request->user(), $project);
        abort_if($project->workspace_id !== $workspace->id, 404);

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'required|in:active,inactive',
            'priority'    => 'required|in:low,medium,high', // Tambah ini
            'due_date'    => 'nullable|date',
        ]);

        $project->update($validated);
        return back()->with('success', 'Project updated successfully.');
    }

    public function destroy(Request $request, Workspace $workspace, Project $project)
    {
        $this->authorizeProject($request->user(), $project);
        abort_if($project->workspace_id !== $workspace->id, 404);
        $project->delete();
        return back()->with('success', 'Project deleted successfully.');
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
            ->when($request->search, function($q, $search) {
                $q->where('name', 'like', "%{$search}%");
            })
            
            // 3. Filter Status (Multi-select)
            ->when($request->status, function($q, $status) {
                $q->whereIn('status', (array)$status);
            })
            
            // 4. Filter Priority (Multi-select)
            ->when($request->priority, function($q, $priority) {
                $q->whereIn('priority', (array)$priority);
            })

            // 5. Filter Workspace/Sector (Multi-select)
            ->when($request->workspaces, function($q, $workspaces) {
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
