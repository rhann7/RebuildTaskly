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

        if (!$user->isSuperAdmin()) {
            abort_if($workspace->company_id !== $company->id, 403);
        }

        $projects = Project::query()
            ->where('workspace_id', $workspace->id)
            ->with(['tasks', 'workspace.manager']) // Tarik si Bedul di sini
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->latest()
            ->paginate(12)
            ->through(function ($project) {
                // 1. Progress (Udah aman di Tinker lo keliatan +progress: 33.0)
                $total = $project->tasks->count();
                $done = $project->tasks->filter(fn($t) => $t->status === 'done')->count();
                $project->progress = $total > 0 ? round(($done / $total) * 100) : 0;

                // 2. Assignee Logic (Ambil data Bedul)
                // Di Tinker lo: $project->workspace->manager->name
                $manager = $project->workspace->manager ?? null;

                if ($manager) {
                    // KITA SET PROPERTY 'assignee' SUPAYA DIBACA REACT
                    $project->assignee = [
                        'name'   => $manager->name, // Ini bakal dapet "bedul"
                        // Laravel User model biasanya pakai profile_photo_url kalau pakai Jetstream
                        // Kalau gak ada, biarin null nanti dihandle sama UI-Avatars di React
                        'avatar' => $manager->profile_photo_url ?? null, 
                    ];
                } else {
                    $project->assignee = null;
                }

                return $project;
            });

        return Inertia::render('projects/index', [
            'workspace' => $workspace,
            'projects'  => $projects,
            'filters'   => $request->only(['search']),
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
        $user = $request->user();

        // 1. VALIDASI DASAR & KEAMANAN
        abort_if($project->workspace_id !== $workspace->id, 404);

        // GATE KEEPER: Hanya Admin, Manager Workspace, atau Member Project yang bisa masuk
        if (!$user->isSuperAdmin()) {
            $isCompany = $user->hasRole('company');
            $isWorkspaceManager = $workspace->manager_id === $user->id;
            $isProjectMember = $project->members()->where('users.id', $user->id)->exists();

            if (!$isCompany && !$isWorkspaceManager && !$isProjectMember) {
                // Kita arahkan kembali ke halaman detail Workspace
                return redirect()->route('workspaces.show', $workspace->slug)
                    ->with('error', 'AUTHORIZATION ERROR: Unit not deployed to this project sector.');
            }
        }

        // --- HITUNG PROGRESS (Pake manual load buat jaga-jaga appends gak kebaca) ---
        $project->tasks_count = $project->tasks()->count();
        $completedTasksCount = $project->tasks()->where('status', 'done')->count();
        $project->progress = $project->tasks_count > 0
            ? round(($completedTasksCount / $project->tasks_count) * 100)
            : 0;

        // --- MANAJEMEN PERSONNEL ---
        
        // 1. Ambil Manager Workspace
        $managers = collect();
        if ($workspace->manager) {
            $managers = collect([$workspace->manager])->map(fn($m) => [
                'id'           => $m->id,
                'name'         => $m->name,
                'email'        => $m->email,
                'avatar'       => $m->profile_photo_url,
                'project_role' => 'Workspace Manager',
                'is_manager'   => true,
            ]);
        }

        // 2. Ambil Member Project (Pivot data)
        $members = $project->members()
            ->get()
            ->map(fn($m) => [
                'id'           => $m->id,
                'name'         => $m->name,
                'email'        => $m->email,
                'avatar'       => $m->profile_photo_url,
                'project_role' => $m->pivot->project_role,
                'is_manager'   => false,
            ]);

        // 3. Gabungkan Semua Personnel
        $allPersonnel = $managers->concat($members);

        // 4. Filter Karyawan yang Bisa Ditambah (Exclude yang sudah jadi member/manager)
        $managerId = $workspace->manager_id;
        $availableEmployees = $workspace->members()
            ->whereDoesntHave('projects', function ($q) use ($project) {
                $q->where('project_id', $project->id);
            })
            ->when($managerId, fn($q) => $q->where('users.id', '!=', $managerId))
            ->get(['users.id', 'users.name', 'users.email']);

        return Inertia::render('projects/show', [
            'workspace'          => $workspace,
            'project'            => $project,
            'tasks'              => $project->tasks()->latest()->get(),
            'projectMembers'     => $allPersonnel,
            'availableEmployees' => $availableEmployees,
            'isSuperAdmin'       => $user->isSuperAdmin(),
            // Tambahin ini biar di frontend lo bisa sembunyiin tombol "Add Member" buat member biasa
            'can_manage'         => $user->isSuperAdmin() || $user->id === $workspace->manager_id,
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
