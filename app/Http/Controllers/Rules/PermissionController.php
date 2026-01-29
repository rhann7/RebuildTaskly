<?php

namespace App\Http\Controllers\Rules;

use App\Http\Controllers\Controller;
use App\Http\Requests\Rules\PermissionRequest;
use App\Models\Company;
use App\Models\Module;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class PermissionController extends Controller
{
    public function index(Request $request)
    {
        $permissions = Permission::with('module')
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->type && $request->type !== 'all', fn($q) => $q->where('type', $request->type))
            ->when($request->scope && $request->scope !== 'all', fn($q) => $q->where('scope', $request->scope))
            ->when($request->filled('isMenu'), fn ($q) => $q->where('isMenu', $request->isMenu))
            ->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('permissions/index', [
            'permissions' => $this->transformPermissions($permissions),
            'filters'     => $request->only(['search', 'type', 'scope', 'isMenu']),
            'modules'     => Module::select('id', 'name')->orderBy('name')->get(),
            'pageConfig'  => $this->getPageConfig($request),
        ]);
    }

    public function store(PermissionRequest $request)
    {
        DB::transaction(function () use ($request) {
            $permission = Permission::create($request->validated() + ['guard_name' => 'web']);

            Role::where('name', 'super-admin')->first()?->givePermissionTo($permission);

            if ($permission->type === 'general') $this->assignPermissionToAllCompanies($permission);
        });
            
        $this->clearCache();
        return redirect()->route('access-control.permissions.index')->with('success', 'Permission Created');
    }

    public function update(PermissionRequest $request, Permission $permission)
    {
        DB::transaction(function () use ($request, $permission) {

            $oldType = $permission->type;
            $permission->update($request->validated());

            if ($oldType !== 'general' && $permission->type === 'general') $this->assignPermissionToAllCompanies($permission);
        });

        $this->clearCache();
        return redirect()->route('access-control.permissions.index')->with('success', 'Permission Updated');
    }


    public function destroy(Permission $permission)
    {
        $permission->delete();

        $this->clearCache();
        return redirect()->route('access-control.permissions.index')->with('success', 'Permission Deleted');
    }

    private function getPageConfig(Request $request)
    {
        return [
            'title'       => 'Manage Permissions',
            'description' => 'Control access levels and module mapping.',
            'can_manage'  => $request->user()->isSuperAdmin(),
            'routes'      => $this->getAvailableRoutes(),
            'options'     => [
                'scopes'  => [
                    ['label' => 'Company', 'value' => 'company'],
                    ['label' => 'Workspace', 'value' => 'workspace'],
                ],
                'types'   => [
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

    private function getAvailableRoutes()
    {
        return collect(Route::getRoutes())
            ->map(fn($r) => [
                'route_path' => '/' . ltrim($r->uri(), '/'),
                'route_name' => $r->getName(),
                'controller_action' => $r->getActionName(),
            ])
            ->whereNotNull('route_name')
            ->values();
    }

    private function transformPermissions($pagination)
    {
        $pagination->getCollection()->transform(fn($p) => [
            'id'                => $p->id,
            'name'              => $p->name,
            'module_id'         => $p->module_id,
            'module_name'       => $p->module?->name ?? 'Unassigned',
            'type'              => $p->type,
            'scope'             => $p->scope,
            'price_raw'         => $p->price,
            'price_fmt'         => 'Rp ' . number_format($p->price, 0, ',', '.'),
            'route_path'        => $p->route_path,
            'route_name'        => $p->route_name,
            'controller_action' => $p->controller_action,
            'icon'              => $p->icon,
            'isMenu'            => (bool)$p->isMenu,
        ]);

        return $pagination;
    }

    private function assignPermissionToAllCompanies($permission)
    {
        Company::whereDoesntHave('permissions', fn ($q) =>
            $q->where('permissions.id', $permission->id)
        )
        ->chunkById(100, function ($companies) use ($permission) {
            foreach ($companies as $company) {
                $company->givePermissionTo($permission);
            }
        });
    }

    private function clearCache()
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
        Cache::forget('dynamic_routes');
    }
}