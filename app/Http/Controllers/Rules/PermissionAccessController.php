<?php

namespace App\Http\Controllers\Rules;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;

class PermissionAccessController extends Controller
{
    public function index(Request $request)
    {
        $query = Company::with('permissions');

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('type')) {
            if ($request->type === 'unique') {
                $query->whereHas('permissions', function($q) {
                    $q->where('type', 'unique');
                });
            } elseif ($request->type === 'general') {
                $query->whereDoesntHave('permissions', function($q) {
                    $q->where('type', 'unique');
                });
            }
        }

        $companies = $query->orderBy('name', 'asc')->paginate(10)->withQueryString();
        
        return Inertia::render('permissions/access', [
            'companies'           => $companies,
            'uniquePermissions'   => Permission::where('type', 'unique')->get(),
            'generalPermissions'  => Permission::where('type', 'general')->get(),
            'filters'             => $request->only(['search', 'type']),
        ]);
    }
    
    public function update(Request $request, Company $company)
    {
        $request->validate([
            'permission_name' => 'required|exists:permissions,name',
            'enabled'         => 'required|boolean',
        ]);

        $permission = Permission::where('name', $request->permission_name)->firstOrFail();

        if ($request->enabled) {
            $company->givePermissionTo($permission->name);
            $message = "Access '{$permission->name}' granted to {$company->name}.";
        } else {
            $company->revokePermissionTo($permission->name);
            $message = "Access '{$permission->name}' revoked from {$company->name}.";
        }

        return redirect()->back()->with('success', $message);
    }
}