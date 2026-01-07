<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;

class CheckCompanyPermission
{
    public function handle(Request $request, Closure $next, string $permission)
    {
        $user = $request->user();
        abort_if(!$user, 403);

        if ($user->hasRole('super-admin')) {
            return $next($request);
        }

        $company = $user->companyOwner->company ?? null;

        $up = $user->getAllPermissions()->pluck('name');
        $cp = $company ? $company->getAllPermissions()->pluck('name') : collect();
        $ap = $up->merge($cp)->unique();

        if (!$ap->contains($permission)) {
            abort(403, "Company anda tidak memiliki akses ke fitur: {$permission}");
        }

        return $next($request);
    }
}
