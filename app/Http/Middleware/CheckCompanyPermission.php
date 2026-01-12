<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckCompanyPermission
{
    public function handle(Request $request, Closure $next, string $permission)
    {
        $user = $request->user();
        abort_if(!$user, 403);

        if ($user->hasRole('super-admin')) {
            return $next($request);
        }

        $workspaceId = $request->route('workspace'); 
        $workspaceId = is_object($workspaceId) ? $workspaceId->id : $workspaceId;

        if ($workspaceId) {
            $role = $user->getWorkspaceRole((int)$workspaceId);
            if (!$role || !$role->hasPermissionTo($permission)) {
                abort(403, "Jabatan Anda di workspace ini tidak mengizinkan akses: {$permission}");
            }
        }

        $company = $user->companyOwner->company ?? null;
        $up = $user->getAllPermissions()->pluck('name');
        $cp = $company 
            ? cache()->remember("company-{$company->id}-permissions", 3600, fn() => $company->getAllPermissions()->pluck('name')) 
            : collect();
        $ap = $up->merge($cp)->unique();

        if (!$ap->contains($permission)) {
            abort(403, "Company anda tidak memiliki akses ke fitur: {$permission}");
        }

        return $next($request);
    }
}