<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class CheckCompanyPermission
{
    public function handle(Request $request, Closure $next, ?string $permission = null)
    {
        $user = $request->user();
        abort_if(!$user, 403, 'Anda belum login.');

        if ($user->isSuperAdmin()) return $next($request);

        $company = $user->company;
        abort_if(!$company, 403, 'Akun ini tidak terhubung dengan company.');

        if (!$company->is_active) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            abort(403, "Akses ditolak. Perusahaan Anda ({$company->name}) sedang ditangguhkan.");
        }

        $routeName = $request->route()->getName();
        $whiteList = ['dashboard', 'profile.edit', 'profile.update', 'profile.destroy', 'impersonate.take', 'impersonate.leave'];
        if (in_array($routeName, $whiteList)) return $next($request);

        $permissions = Cache::remember("company-{$company->id}-permissions", now()->addDay(), function () use ($company) {
            return $company->permissions()->get(['id', 'name', 'route_name', 'isGroup', 'group_routes']);
        });

        foreach($permissions as $p) {
            if (!$p->isGroup && $p->route_name === $routeName) {
                return $next($request);
            }

            if ($p->isGroup && $p->group_routes) {
                $patterns = is_array($p->group_routes)
                    ? $p->group_routes
                    : json_decode($p->group_routes, true);
                
                if (is_array($patterns) && str($routeName)->is($patterns)) {
                    return $next($request);
                }
            }
        }

        if ($permission && $permissions->contains('name', $permission)) {
            return $next($request);
        }

        abort(403, "Company tidak memiliki akses ke fitur/rute: {$routeName}");
    }
}
