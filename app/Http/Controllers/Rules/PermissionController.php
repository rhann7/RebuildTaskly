<?php

namespace App\Http\Controllers\Rules;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    public function index(Request $request)
    {
        $query = Permission::query();

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        $permissions = $query->orderBy('id', 'asc')->paginate(10)->withQueryString();

        return Inertia::render('permissions/index', [
            'permissions' => $permissions,
            'filters'     => $request->only(['search', 'type'])
        ]);
    }

    public function store(Request $request)
    {
        $datas = $request->validate([
            'name'  => 'required|string|max:255|unique:permissions,name',
            'type'  => 'required|string|in:general,unique',
            'price' => 'required|numeric|min:0|max:999999999.99',
        ]);

        $permission = Permission::create([...$datas, 'guard_name' => 'web']);

        if ($request->type === 'general') {
            Company::chunk(100, function ($companies) use ($permission) {
                foreach ($companies as $company) {
                    $company->givePermissionTo($permission);
                }
            });
        }

        return redirect()->back()->with('success', 'Permission created successfully.');
    }

    public function update(Request $request, Permission $permission)
    {
        $datas = $request->validate([
            'name'  => ['required', 'string', 'max:255', Rule::unique('permissions')->ignore($permission->id)],
            'type'  => 'required|string|in:general,unique',
            'price' => 'required|numeric|min:0|max:999999999.99',
        ]);

        $permission->update($datas);
        return redirect()->back()->with('success', 'Permission updated successfully.');
    }

    public function destroy(Permission $permission)
    {
        $permission->delete();
        return redirect()->back()->with('success', 'Permission deleted successfully.');
    }
}