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

    public function show(Module $module)
    {
        $module->load(['permissions' => function($query) {
            $query->orderBy('name', 'asc');
        }]);

        return Inertia::render('modules/show', [
            'module' => [
                'id'          => $module->id,
                'name'        => $module->name,
                'slug'        => $module->slug,
                'type'        => $module->type,
                'permissions' => $module->permissions->map(fn($p) => [
                    'id'   => $p->id,
                    'name' => $p->name,
                ]),
            ],
            'homeless_permissions' => Permission::homeless()->get(['id', 'name']),
        ]);
    }

    public function store(ModuleRequest $moduleRequest)
    {
        $validated = $moduleRequest->validated();
        $validated['price'] = 0;

        Module::create($validated);
        return redirect()->back()->with('success', 'Module Created Successfully');
    }

    public function update(ModuleRequest $moduleRequest, Module $module)
    {
        $module->update($moduleRequest->validated());
        return redirect()->back()->with('success', 'Module Updated Successfully');
    }

    public function destroy(Module $module)
    {
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
        $pagination->getCollection()->transform(fn($m) => [
            'id'   => $m->id,
            'name' => $m->name,
            'slug' => $m->slug,
            'ui'   => [
                'type_label' => ucfirst($m->type),
                'type_color' => $m->type === 'addon' 
                    ? 'text-amber-600 border-amber-200 bg-amber-50' 
                    : 'text-zinc-500 border-zinc-200 bg-zinc-50',
                'type_icon' => $m->type === 'addon' ? 'Zap' : 'Box',
                
                'status_label' => $m->is_active ? 'Active' : 'Inactive',
                'status_color' => $m->is_active ? 'text-green-600' : 'text-zinc-400',
                
                'price_fmt' => 'Rp ' . number_format($m->price, 0, ',', '.'),
                'permissions_count' => $m->permissions_count ?? 0,
            ],
            'form_default' => [
                'name'        => $m->name,
                'type'        => $m->type,
                'description' => $m->description ?? '',
                'is_active'   => (bool)$m->is_active,
            ]
        ]);

        return $pagination;
    }

    private function recalculateModulePrice(Module $module)
    {
        $totalPrice = $module->permissions()->sum('price');
        $finalPrice = $totalPrice * 0.95;
        $module->update(['price' => $finalPrice]);
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