<?php

namespace App\Http\Controllers\Rules;

use App\Http\Controllers\Controller;
use App\Http\Requests\Rules\PermissionRequest;
use App\Models\Company;
use App\Models\Module;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Spatie\Permission\PermissionRegistrar;

class PermissionController extends Controller
{
    public function index(Request $request)
    {
        $permissions = Permission::query()
            ->with('module')
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->type && $request->type !== 'all', fn($q) => $q->where('type', $request->type))
            ->when($request->scope && $request->scope !== 'all', fn($q) => $q->where('scope', $request->scope))
            ->when($request->filled('module_id') && $request->module_id !== 'all', function($q) use ($request) {
                return $request->module_id === 'unassigned' 
                    ? $q->whereNull('module_id')
                    : $q->where('module_id', $request->module_id);
            })
            ->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('permissions/index', [
            'permissions' => $this->transformPermissions($permissions),
            'filters'     => $request->only(['search', 'type', 'scope', 'module_id']),
            'pageConfig'  => $this->getPageConfig($request),
        ]);
    }

    public function store(PermissionRequest $request)
    {
        DB::transaction(function () use ($request) {
            $permission = Permission::create($request->validated() + ['guard_name' => 'web']);
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
            'description' => 'Control access levels and dynamic routing.',
            'can_manage'  => $request->user()->isSuperAdmin(),
            'routes'      => $this->getAvailableRoutes(),
            'options'     => [
                'scopes'  => [
                    ['label' => 'Company', 'value' => 'company'],
                    ['label' => 'Workspace', 'value' => 'workspace'],
                ],
                'types'      => [
                    ['label' => 'General', 'value' => 'general'],
                    ['label' => 'Unique', 'value' => 'unique'],
                ],
                'modules'   => Module::all()->map(fn($m) => [
                    'label' => $m->name,
                    'value' => (string)$m->id,
                ])->toArray(),
            ]
        ];
    }

    private function transformPermissions($pagination)
    {
        $pagination->getCollection()->transform(fn($p) => [
            'id'   => $p->id,
            'name' => $p->name,
            'ui'   => [
                'type_label'  => ucfirst($p->type),
                'type_color'  => $p->type === 'unique' ? 'text-purple-500' : 'text-white',
                'scope_label' => ucfirst($p->scope),
                'price_fmt'   => 'Rp ' . number_format($p->price, 0, ',', '.'),
                'is_menu'     => (bool)$p->isMenu,
                'module_name' => $p->module?->name ?? 'Unassigned',
                'has_module'  => (bool)$p->module_id,
            ],
            'route_info' => [
                'name'   => $p->route_name,
            ],
            'form_default'   => [
                'name'       => $p->name,
                'type'       => $p->type,
                'scope'      => $p->scope,
                'price'      => (string)$p->price,
                'route_name' => $p->route_name,
                'icon'       => $p->icon ?? '',
                'isMenu'     => (bool)$p->isMenu,
            ]
        ]);

        return $pagination;
    }

    private function assignPermissionToAllCompanies($permission)
    {
        Company::whereDoesntHave('permissions', fn ($q) => $q->where('permissions.id', $permission->id))
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

    private function getAvailableRoutes()
    {
        return collect(Route::getRoutes())
            ->map(fn($r) => ['route_name' => $r->getName()])
            ->whereNotNull('route_name')
            ->values();
    }
}