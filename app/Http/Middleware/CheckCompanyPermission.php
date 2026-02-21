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

        $isImpersonating = app('impersonate')->isImpersonating();
        if ($isImpersonating && !$request->isMethod('GET') && !$request->isMethod('HEAD')) {
            if (!$request->routeIs('impersonate.leave')) abort(403, "Mode Lihat Saja: Anda tidak diizinkan mengubah data saat dalam mode penyamaran.");
        }

        if ($user->isSuperAdmin() && !$isImpersonating) return $next($request);
        
        $company = $user->company;
        abort_if(!$company, 403, 'Akun ini tidak terhubung dengan company.');

        $routeName = $request->route()->getName();
        $whiteList = ['dashboard', 'impersonate.take', 'impersonate.leave'];
        if (in_array($routeName, $whiteList)) return $next($request);

        $dbPermission = Permission::with('module')->where('route_name', $routeName)->first();
        if ($dbPermission) {
            // if (!$company->hasAccess($dbPermission->name)) abort(403, "Fitur ini tidak tersedia dalam paket Anda.");

            $module = $dbPermission->module;
            if ($module) {
                $workspaceParam = $request->route('workspace');

                if ($module->isCompanyScope() && $workspaceParam) abort(403, "Fitur ini adalah fitur level Perusahaan, tidak bisa diakses dari dalam Workspace.");

                if ($module->isWorkspaceScope()) {
                    if (!$workspaceParam) abort(403, "Fitur ini hanya dapat diakses melalui konteks Workspace.");

                    $workspaceId = is_object($workspaceParam) ? $workspaceParam->id : $workspaceParam;
                    $exists = $company->workspaces()->where('id', $workspaceId)->exists();

                    abort_if(!$exists, 403, "Workspace tidak ditemukan atau bukan milik perusahaan Anda.");
                }
            }

            return $next($request);
        }
        
        abort(403, "Akses ditolak. Fitur ini belum terdaftar dalam sistem kontrol.");
    }
}