<?php

namespace App\Http\Controllers\Rules;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;

class PermissionAccessController extends Controller
{
    public function index(Request $request)
    {
        $query = Company::query()->with('permissions');

        $query->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->type, function ($q, $type) {
                if ($type === 'unique') return $q->whereHas('permissions', fn($p) => $p->where('type', 'unique'));
                if ($type === 'general') return $q->whereDoesntHave('permissions', fn($p) => $p->where('type', 'unique'));
            });

        return Inertia::render('permissions/access', [
            'companies'          => $query->orderBy('name', 'asc')->paginate(10)->withQueryString(),
            'uniquePermissions'  => Permission::where('type', 'unique')->orderBy('id')->get(),
            'generalPermissions' => Permission::where('type', 'general')->orderBy('id')->get(),
            'filters'            => $request->only(['search', 'type']),
        ]);
    }
    
    public function update(Request $request, Company $company)
    {
        $validated = $request->validate([
            'permissions'   => 'present|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        return DB::transaction(function () use ($validated, $company) {
            $company->syncPermissions($validated['permissions']);

            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
            Cache::forget("company-{$company->id}-permissions");

            return redirect()->back()->with('success', "Akses diperbarui.");
        });
    }
}