<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;

class CheckCompanyPermission
{
    public function handle(Request $request, Closure $next, string $permissionName)
    {
        $permission = cache()->remember("perm-def-{$permissionName}", 3600, function() use ($permissionName) {
            return Permission::where('name', $permissionName)->first();
        });

        if ($permission && $permission->scope === 'system') {
            return $next($request);
        }

        $user = $request->user();
        if (!$user || !$user->companyOwner?->company) {
            abort(403, 'Company context not found.');
        }

        $company = $user->companyOwner?->company;
        $cacheKey = "company-{$company->id}-permission-{$permissionName}";

        $hasAccess = cache()->remember($cacheKey, 3600, function () use ($company, $permissionName) {
            return $company->hasPermissionTo($permissionName, 'web');
        });

        if (!$hasAccess) {
            abort(403, "Fitur '{$permissionName}' tidak aktif untuk paket layanan Anda.");
        }

        return $next($request);
    }
}