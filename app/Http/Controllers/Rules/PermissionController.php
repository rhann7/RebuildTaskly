<?php

namespace App\Http\Controllers\Rules;

use App\Http\Controllers\Controller;
use App\Http\Requests\Rules\PermissionRequest;
use App\Models\Module;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
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
            'filters'     => $request->only(['search', 'module_id']),
            'pageConfig'  => $this->getPageConfig($request),
        ]);
    }

    public function store(PermissionRequest $request)
    {
        Permission::create($request->validated());
        $this->clearCache();
        return redirect()->route('access-control.permissions.index')->with('success', 'Permission Created');
    }

    public function update(PermissionRequest $request, Permission $permission)
    {
        $permission->update($request->validated());
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
                'modules'   => Module::where('is_active', true)
                    ->get()
                    ->map(fn($m) => [
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
                'icon'        => $p->icon,
                'is_menu'     => (bool)$p->isMenu,
                'module_name' => $p->module?->name ?? 'Unassigned',
                'has_module'  => (bool)$p->module_id,
            ],
            'route_info' => [
                'name'   => $p->route_name,
            ],
            'form_default'   => [
                'name'       => $p->name,
                'route_name' => $p->route_name,
                'icon'       => $p->icon ?? '',
                'isMenu'     => (bool)$p->isMenu,
                'module_id'  => $p->module_id,
            ]
        ]);

        return $pagination;
    }

    private function clearCache()
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
        Cache::forget('permissions.dynamic_routes');
    }

    private function getAvailableRoutes()
    {
        return Cache::rememberForever('permissions.available_routes', fn () =>
            collect(Route::getRoutes())
                ->map(fn($r) => ['route_name' => $r->getName()])
                ->whereNotNull('route_name')
                ->values()
        );
    }
}