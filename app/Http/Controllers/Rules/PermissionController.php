<?php

namespace App\Http\Controllers\Rules;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionController extends Controller
{
    private function clearAllPermissionCache()
    {
        Cache::forget('dynamic_routes');
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        Company::select('id')->chunk(100, function ($companies) {
            foreach ($companies as $company) {
                Cache::forget("company-{$company->id}-permissions");
            }
        });
    }

    private function getPageConfig(Request $request)
    {
        $routes = collect(Route::getRoutes())
            ->map(fn($route) => [
                'route_path'        => '/' . ltrim($route->uri(), '/'),
                'route_name'        => $route->getName(),
                'controller_action' => $route->getActionName(),
            ])
            ->whereNotNull('route_name')
            ->values();

        return [
            'title'       => 'Manage Permissions',
            'description' => 'Control access levels and feature availability.',
            'can_manage'  => $request->user()->isSuperAdmin(),
            'routes'      => $routes,
            'options'     => [
                'scopes'  => [
                    ['label' => 'All Scopes', 'value' => 'all'],
                    ['label' => 'Company', 'value' => 'company'],
                    ['label' => 'Workspace', 'value' => 'workspace'],
                ],
                'types'   => [
                    ['label' => 'All Types', 'value' => 'all'],
                    ['label' => 'General', 'value' => 'general'],
                    ['label' => 'Unique', 'value' => 'unique'],
                ],
                'booleans' => [
                    ['label' => 'Yes', 'value' => 1],
                    ['label' => 'No', 'value' => 0],
                ]
            ]
        ];
    }

    public function index(Request $request)
    {
        $permissions = Permission::query()
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->type && $request->type !== 'all', fn($q) => $q->where('type', $request->type))
            ->when($request->scope && $request->scope !== 'all', fn($q) => $q->where('scope', $request->scope))
            ->when($request->filled('isMenu'), fn($q) => $q->where('isMenu', $request->isMenu))
            ->when($request->filled('isGroup'), fn($q) => $q->where('isGroup', $request->isGroup))
            ->orderBy('id')
            ->paginate(10)
            ->withQueryString();

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
            'scope'             => 'required|string|in:company,workspace',
            'price'             => 'required|numeric|min:0|max:999999999.99',
            'route_path'        => 'nullable|string',
            'route_name'        => 'nullable|string',
            'controller_action' => 'nullable|string',
            'icon'              => 'nullable|string',
            'isMenu'            => 'boolean',
            'isGroup'           => 'boolean',
            'group_routes'      => 'nullable|string',
        ]);

        if ($request->isGroup && $request->group_routes) {
            $routesArray = array_map('trim', explode(',', $request->group_routes));
            $datas['group_routes'] = json_encode($routesArray);
        }

        return DB::transaction(function () use ($datas, $request) {
            $permission = Permission::create([...$datas, 'guard_name' => 'web']);

            Role::where('name', 'super-admin')->first()?->givePermissionTo($permission);

            if ($permission->type === 'general' && !$permission->isGroup) {
                Company::chunk(100, function ($companies) use ($permission) {
                    foreach ($companies as $company) {
                        $company->givePermissionTo($permission);
                    }
                });
            }

            $this->clearAllPermissionCache();
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
            'isGroup'           => 'boolean',
            'group_routes'      => 'nullable|string',
        ]);

        if (isset($datas['group_routes'])) {
            if ($request->isGroup && $request->group_routes) {
                $routesArray = array_map('trim', explode(',', $request->group_routes));
                $datas['group_routes'] = json_encode($routesArray);
            } else {
                $datas['group_routes'] = null;
            }
        }

        return DB::transaction(function () use ($datas, $permission) {
            $permission->update($datas);

            if ($permission->wasChanged('type') || $permission->wasChanged('isGroup')) {
                if ($permission->type === 'general' && !$permission->isGroup) {
                    Company::whereDoesntHave('permissions', fn($q) => $q->where('id', $permission->id))
                        ->chunk(100, function($companies) use ($permission) {
                            foreach($companies as $c) {
                                $c->givePermissionTo($permission);
                            }
                        });
                }
            }

            $this->clearAllPermissionCache();
            return redirect()->back()->with('success', 'Permission updated successfully.');
        });
    }

    public function destroy(Permission $permission)
    {
        $permission->delete();

        $this->clearAllPermissionCache();
        return redirect()->back()->with('success', 'Permission deleted successfully.');
    }
}