<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class CheckCompanyPermission
{
    public function handle(Request $request, Closure $next, string $permission)
    {
        $user = $request->user();
        abort_if(!$user, 403);

        if ($user->hasRole('super-admin')) {
            return $next($request);
        }

        $company = $user->company ?? ($user->companyOwner->company ?? null);
        if ($company && !$company->is_active) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            abort(403, "Akses ditolak. Perusahaan Anda ({$company->name}) sedang ditangguhkan. Silakan hubungi admin.");
        }

        $workspaceId = $request->route('workspace'); 
        $workspaceId = is_object($workspaceId) ? $workspaceId->id : $workspaceId;

        if ($workspaceId) {
            $role = $user->getWorkspaceRole((int)$workspaceId);
            if (!$role || !$role->hasPermissionTo($permission)) {
                abort(403, "Jabatan Anda di workspace ini tidak mengizinkan akses: {$permission}");
            }
        }

        $up = $user->getAllPermissions()->pluck('name');        
        $cp = $company 
            ? Cache::remember("company-{$company->id}-permissions", 3600, fn() => $company->getAllPermissions()->pluck('name')) 
            : collect();
        $ap = $up->merge($cp)->unique();

        if (!$ap->contains($permission)) {
            abort(403, "Company anda tidak memiliki akses ke fitur: {$permission}");
        }

        return $next($request);
    }
}