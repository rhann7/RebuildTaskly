<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Permission;

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

        $whiteList = [
            'dashboard', 
            'profile.edit', 
            'profile.update', 
            'profile.destroy', 
            'impersonate.take', 
            'impersonate.leave',
        ];

        if (in_array($routeName, $whiteList)) return $next($request);

        if (!$permission) {
            $dbPermission = Permission::where('route_name', $routeName)->first();
            abort_if(!$dbPermission, 403, "Rute {$routeName} belum dikonfigurasi.");

            $permission = $dbPermission->name;
        }

        $hasPermission = $company->permissions()->where('name', $permission)->exists();
        abort_if(!$hasPermission, 403, "Company tidak memiliki perizinan {$permission}");

        return $next($request);
    }
}