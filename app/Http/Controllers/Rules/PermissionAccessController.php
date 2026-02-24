<?php

namespace App\Http\Controllers\Rules;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User; // Tambahkan ini
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;

class PermissionAccessController extends Controller
{
    public function index(Request $request)
    {
        // Tetap gunakan relasi company ke permissions untuk tampilan UI
        $query = Company::query()->with('permissions');

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
            'uniquePermissions'  => Permission::where('type', 'unique')->get(),
            'generalPermissions' => Permission::where('type', 'general')->get(),
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

            // 1. Cari Owner Perusahaan (User dengan role 'company' di perusahaan ini)
            $owner = User::role('company')
                ->where('company_id', $company->id)
                ->first();

            if ($validated['enabled']) {
                // Berikan ke Company (biar tampilan UI index tetap sinkron)
                $company->givePermissionTo($permission);
                
                // 2. Berikan ke Owner (Supaya Middleware CheckCompanyPermission tembus)
                if ($owner) {
                    $owner->givePermissionTo($permission);
                }
                
                $message = "Access '{$permission->name}' granted to {$company->name}.";
            } else {
                // Cabut dari Company
                $company->revokePermissionTo($permission);
                
                // 3. Cabut dari Owner
                if ($owner) {
                    $owner->revokePermissionTo($permission);
                }
                
                $message = "Access '{$permission->name}' revoked from {$company->name}.";
            }

            // Bersihkan Cache Spatie & Cache Custom Middleware lo
            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
            Cache::forget("company-{$company->id}-permissions");
            Cache::forget("company_perms_{$company->id}"); // Sesuai nama cache di middleware lo

            return redirect()->back()->with('success', $message);
        });
    }
}