<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Permission;

class CheckCompanyPermission
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        abort_if(!$user, 403, 'Anda belum login.');

        if ($user->isSuperAdmin() && !app('impersonate')->isImpersonating()) return $next($request);
        
        $company = $user->company;
        abort_if(!$company, 403, 'Akun ini tidak terhubung dengan company.');

        $routeName = $request->route()->getName();
        $whiteList = ['dashboard', 'impersonate.take', 'profile.edit', 'profile.update', 'profile.destroy'];
        if (in_array($routeName, $whiteList)) return $next($request);

        $dbPermission = Permission::with('module')->where('route_name', $routeName)->first();
        if ($dbPermission) {
            if (!$company->hasAccess($dbPermission->name)) abort(403, "Fitur ini tidak tersedia dalam paket Anda.");

            $module = $dbPermission->module;
            if ($module && $module->isWorkspaceScope()) {
                $workspace = $request->route('workspace');
                if ($workspace) {
                    $workspaceId = is_object($workspace) ? $workspace->id : $workspace;
                    $exists = $company->workspaces()->where('id', $workspaceId)->exists();

                    abort_if(!$exists, 403, "Workspace tidak ditemukan atau bukan milik perusahaan Anda.");
                }
            }

            return $next($request);
        }
        
        abort(403, "Akses ditolak. Fitur ini belum terdaftar dalam sistem kontrol.");
    }
}