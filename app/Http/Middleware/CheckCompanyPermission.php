<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckCompanyPermission
{
    public function handle(Request $request, Closure $next, string $permissionName)
    {
        $user = $request->user();
        if (!$user || !$user->companyOwner?->company) {
            abort(403, 'Company context not found.');
        }

        $company = $user->companyOwner?->company;
        $cahceKey = "company-{$company->id}-permission-{$permissionName}";

        $hasAccess = cache()->remember($cahceKey, 3600, function () use ($company, $permissionName) {
            return $company->hasPermissionTo($permissionName, 'web');
        });

        if (!$hasAccess) {
        abort(403, "Fitur '{$permissionName}' tidak tersedia untuk perusahaan Anda.");
    }

        return $next($request);
    }
}