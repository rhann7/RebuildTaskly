<?php

namespace App\Http\Controllers\Workspaces;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class WorkspaceController extends Controller
{
    private function resolveCompany($user)
    {
        if ($user->isSuperAdmin()) return null;

        $company = $user->company ?? $user->companyOwner?->company;
        abort_if(!$company, 403, 'Anda tidak terikat dengan perusahaan manapun.');

        return $company;
    }

    private function authorizeWorkspace($user, Workspace $workspace)
    {
        if ($user->isSuperAdmin()) return;
        
        $company = $this->resolveCompany($user);

        abort_if($workspace->company_id !== $company->id, 403);
    }

    private function getPageConfig(Request $request)
    {
        $user = $request->user();
        $canManage = $user->isSuperAdmin() || $user->hasAnyPermission(['access-workspaces', 'manage-workspaces']);

        return [
            'title'       => $user->isSuperAdmin() ? 'Workspace Management' : 'My Workspaces',
            'description' => 'Manage and organize team collaboration environments.',
            'can_manage'  => $canManage,
            'options'     => [
                'statuses' => [
                    ['label' => 'Active', 'value' => 'active'],
                    ['label' => 'Inactive', 'value' => 'inactive'],
                ],
            ]
        ];
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $company = $this->resolveCompany($user);

        $workspaces = Workspace::query()
            ->when(!$user->isSuperAdmin(), fn ($q) => $q->where('company_id', $company->id))
            ->with('company:id,name')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('workspaces/index', [
            'workspaces'   => $workspaces,
            'filters'      => $request->only(['search']),
            'isSuperAdmin' => $user->isSuperAdmin(),
            'pageConfig'   => $this->getPageConfig($request),
            'companies'    => $user->isSuperAdmin() 
                ? Company::select('id', 'name')->orderBy('name')->get() 
                : []
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $company = $this->resolveCompany($user);

        $validated = $request->validate([
            'company_id'  => $user->isSuperAdmin() ? 'required|exists:companies,id' : 'nullable',
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        Workspace::create([
            'company_id'  => $user->isSuperAdmin() ? $validated['company_id'] : $company->id,
            'name'        => $validated['name'],
            'slug'        => Str::slug($validated['name']) . '-' . Str::lower(Str::random(5)),
            'description' => $validated['description'],
            'status'      => 'active',
        ]);

        return back()->with('success', 'Workspace created successfully.');
    }

    public function show(Request $request, Workspace $workspace)
    {
        $this->authorizeWorkspace($request->user(), $workspace);

        $projects = $workspace->projects()
            ->latest()
            ->get();

        return Inertia::render('workspaces/show', [
            'workspace'    => $workspace->load('company:id,name'),
            'projects'     => $projects,
            'isSuperAdmin' => $request->user()->isSuperAdmin(),
        ]);
    }

    public function update(Request $request, Workspace $workspace)
    {
        $this->authorizeWorkspace($request->user(), $workspace);

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'required|in:active,inactive',
            'company_id'  => $request->user()->isSuperAdmin() ? 'required|exists:companies,id' : 'nullable',
        ]);

        $workspace->update($validated);
        return back()->with('success', 'Workspace updated successfully.');
    }

    public function destroy(Request $request, Workspace $workspace)
    {
        $this->authorizeWorkspace($request->user(), $workspace);
        
        $workspace->delete();
        return back()->with('success', 'Workspace deleted successfully.');
    }
}