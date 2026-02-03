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
            ->latest()
            ->paginate(10)
            ->withQueryString();

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
        ]);

        return redirect()
            ->route('workspaces.show', $workspace->slug)
            ->with('success', 'Project created successfully.');
    }


    public function show(Request $request, Workspace $workspace, Project $project)
    {
        abort_if($project->workspace_id !== $workspace->id, 404);

        $this->authorizeProject($request->user(), $project);

        return Inertia::render('projects/show', [
            'workspace' => $workspace,
            'tasks' => $project->tasks()->latest()->get(),
            'project' => $project,
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
}
