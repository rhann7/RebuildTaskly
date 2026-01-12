<?php

namespace App\Http\Controllers\Rules;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;

class PermissionAccessController extends Controller
{
    public function index(Request $request)
    {
        $query = Company::query()->with(['permissions' => function ($q) {
            $q->where('scope', '!=', 'system');
        }]);

        $query->when($request->search, function ($q, $search) {
            $q->where('name', 'like', "%{$search}%");
        })->when($request->type, function ($q, $type) {
            if ($type === 'unique') {
                $q->whereHas('permissions', fn($p) => $p->where('type', 'unique'));
            } elseif ($type === 'general') {
                $q->whereDoesntHave('permissions', fn($p) => $p->where('type', 'unique'));
            }
        });

        return Inertia::render('permissions/access', [
            'companies'          => $query->orderBy('name', 'asc')->paginate(10)->withQueryString(),
            'uniquePermissions'  => Permission::where('type', 'unique')->where('scope', '!=', 'system')->get(),
            'generalPermissions' => Permission::where('type', 'general')->where('scope', '!=', 'system')->get(),
            'filters'            => $request->only(['search', 'type']),
        ]);
    }
    
    public function update(Request $request, Company $company)
    {
        $validated = $request->validate([
            'permission_name' => 'required|exists:permissions,name',
            'enabled'         => 'required|boolean',
        ]);

        return DB::transaction(function () use ($validated, $company) {
            $permission = Permission::where('name', $validated['permission_name'])->firstOrFail();

            if ($validated['enabled']) {
                $company->givePermissionTo($permission);
                $message = "Access '{$permission->name}' granted to {$company->name}.";
            } else {
                $company->revokePermissionTo($permission);
                $message = "Access '{$permission->name}' revoked from {$company->name}.";
            }

            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
            cache()->forget("company-{$company->id}-permissions");

            return redirect()->back()->with('success', $message);
        });
    }
}