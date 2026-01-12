<?php

namespace App\Http\Controllers\Rules;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionController extends Controller
{
    private function getPageConfig(Request $request)
    {
        $routes = collect(Route::getRoutes())->map(function ($route) {
            return [
                'route_path'        => '/' . ltrim($route->uri(), '/'),
                'route_name'        => $route->getName(),
                'controller_action' => $route->getActionName(),
            ];
        })->filter(fn($r) => $r['route_name'] !== null)->values();

        return [
            'title'       => 'Manage Permissions',
            'description' => 'Control access levels and feature availability.',
            'can_manage'  => $request->user()->hasRole('super-admin'),
            'routes'      => $routes,
            'options'     => [
                'scopes'  => [
                    ['label' => 'All Scopes', 'value' => 'all'],
                    ['label' => 'System', 'value' => 'system'],
                    ['label' => 'Company', 'value' => 'company'],
                    ['label' => 'Workspace', 'value' => 'workspace'],
                ],
                'types'   => [
                    ['label' => 'All Types', 'value' => 'all'],
                    ['label' => 'General', 'value' => 'general'],
                    ['label' => 'Unique', 'value' => 'unique'],
                ]
            ]
        ];
    }

    public function index(Request $request)
    {
        $permissions = Permission::query()
            ->when($request->search, fn($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->when($request->type && $request->type !== 'all', fn($q) => $q->where('type', $request->type))
            ->when($request->scope && $request->scope !== 'all', fn($q) => $q->where('scope', $request->scope))
            ->orderBy('id', 'asc')->paginate(10)->withQueryString();

        return Inertia::render('permissions/index', [
            'permissions' => $permissions,
            'filters'     => $request->only(['search', 'type', 'scope']),
            'pageConfig'  => $this->getPageConfig($request)
        ]);
    }

    public function store(Request $request)
    {
        $datas = $request->validate([
            'name'              => 'required|string|max:255|unique:permissions,name',
            'type'              => 'required|string|in:general,unique',
            'scope'             => 'required|string|in:system,company,workspace',
            'price'             => 'required|numeric|min:0|max:999999999.99',
            'route_path'        => 'nullable|string',
            'route_name'        => 'nullable|string',
            'controller_action' => 'nullable|string',
            'icon'              => 'nullable|string',
            'isMenu'            => 'boolean',
        ]);

        return DB::transaction(function () use ($datas, $request) {
            $permission = Permission::create([...$datas, 'guard_name' => 'web']);

            if ($request->scope === 'system') {
                $superAdmin = Role::where('name', 'super-admin')->first();
                if ($superAdmin) $superAdmin->givePermissionTo($permission);
            }
            
            if ($request->type === 'general' && $request->scope !== 'system') {
                Company::chunk(100, function ($companies) use ($permission) {
                    foreach ($companies as $company) {
                        $company->givePermissionTo($permission);
                    }
                });
            }
            
            return redirect()->back()->with('success', 'Permission created successfully.');
        });
    }

    public function update(Request $request, Permission $permission)
    {
        $datas = $request->validate([
            'name'              => ['sometimes', 'string', 'max:255', Rule::unique('permissions')->ignore($permission->id)],
            'type'              => 'sometimes|string|in:general,unique',
            'scope'             => 'sometimes|string|in:system,company,workspace',
            'price'             => 'sometimes|numeric|min:0|max:999999999.99',
            'route_path'        => 'nullable|string',
            'route_name'        => 'nullable|string',
            'controller_action' => 'nullable|string',
            'icon'              => 'nullable|string',
            'isMenu'            => 'boolean',
        ]);

        return DB::transaction(function () use ($datas, $permission) {
            $permission->update($datas);

            if ($permission->wasChanged('type') && $permission->type === 'general' && $permission->scope !== 'system') {
                Company::whereDoesntHave('permissions', fn($q) => $q->where('id', $permission->id))
                    ->chunk(100, function($companies) use ($permission) {
                        foreach($companies as $c) {
                            $c->givePermissionTo($permission);
                        }
                });
            }

            return redirect()->back()->with('success', 'Permission updated successfully.');
        });
    }

    public function destroy(Permission $permission)
    {
        $permission->delete();
        return redirect()->back()->with('success', 'Permission deleted successfully.');
    }
}