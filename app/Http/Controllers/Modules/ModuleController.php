<?php

namespace App\Http\Controllers\Modules;

use App\Http\Controllers\Controller;
use App\Http\Requests\Modules\ModuleRequest;
use App\Models\Module;
use App\Models\Permission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ModuleController extends Controller
{
    public function index(Request $request)
    {
        $modules = Module::query()
            ->withCount('permissions')
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->type && $request->type !== 'all', fn($q, $t) => $q->where('type', $t))
            ->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('modules/index', [
            'modules'    => $this->transformModules($modules),
            'filters'    => $request->only(['search', 'type']),
            'pageConfig' => $this->getPageConfig($request),
        ]);
    }

    public function show(Request $request, Module $module)
    {
        $module->load(['permissions' => function($query) {
            $query->orderBy('name', 'asc');
        }]);

        return Inertia::render('modules/show', [
            'module' => $this->transformSingleModule($module),
            'homeless_permissions' => Permission::homeless()->get(['id', 'name']),
            'pageConfig' => [
                'title'       => 'Module Management',
                'description' => 'Manage commercial feature sets.',
                'can_manage'  => $request->user()->isSuperAdmin(),
            ]
        ]);
    }

    public function store(ModuleRequest $moduleRequest)
    {
        Module::create($moduleRequest->validated());
        return redirect()->back()->with('success', 'Module Created Successfully');
    }

    public function update(ModuleRequest $moduleRequest, Module $module)
    {
        $module->update($moduleRequest->validated());
        return redirect()->back()->with('success', 'Module Updated Successfully');
    }

    public function destroy(Module $module)
    {
        $module->permissions()->update(['module_id' => null]);
        $module->delete();
        return redirect()->route('product-management.modules.index')->with('success', 'Module Deleted');
    }

    private function getPageConfig(Request $request)
    {
        return [
            'title'       => 'Module Management',
            'description' => 'Manage commercial feature sets.',
            'can_manage'  => $request->user()->isSuperAdmin(),
            'options'     => [
                'types' => [
                    ['label' => 'Standard', 'value' => 'standard'],
                    ['label' => 'Add-on', 'value' => 'addon'],
                ],
            ]
        ];
    }

    private function transformModules($pagination)
    {
        $pagination->getCollection()->transform(fn($m) => $this->transformSingleModule($m));
        return $pagination;
    }

    private function transformSingleModule(Module $module)
    {
        return [
            'id'                => $module->id,
            'name'              => $module->name,
            'slug'              => $module->slug,
            'type'              => $module->type,
            'price'             => $module->price,
            'price_fmt'         => 'Rp ' . number_format($module->price, 0, ',', '.'), // Tambahkan ini agar konsisten
            'is_active'         => (bool) $module->is_active,
            'description'       => $module->description,
            'permissions_count' => $module->permissions_count ?? $module->permissions->count(),
            'permissions'       => $module->relationLoaded('permissions') 
                ? $module->permissions->map(fn($p) => [
                    'id'        => $p->id,
                    'name'      => $p->name,
                    'type'      => $p->type,
                    'price'     => $p->price,
                    'price_fmt' => 'Rp ' . number_format($p->price, 0, ',', '.'),
                ]) : [],
            'form_default'    => [
                'name'        => $module->name,
                'type'        => $module->type,
                'description' => $module->description ?? '',
                'is_active'   => (bool)$module->is_active,
            ]
        ];
    }

    private function recalculateModulePrice(Module $module)
    {
        $module->update(['price' => $module->permissions()->sum('price')]);
    }

    public function assignPermissions(Request $request, Module $module)
    {
        $request->validate([
            'permissions'   => 'required|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        Permission::whereIn('id', $request->permissions)
            ->whereNull('module_id')
            ->update(['module_id' => $module->id]);

        $this->recalculateModulePrice($module);
        return redirect()->back()->with('success', 'Permissions Successfully Assigned to Module');
    }

    public function removePermission(Permission $permission)
    {
        $module = $permission->module;
        $permission->update(['module_id' => null]);

        if ($module) $this->recalculateModulePrice($module);
        return redirect()->back()->with('success', 'Permission Removed');
    }
}