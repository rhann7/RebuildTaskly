<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Permission;

class CheckCompanyPermission
{
    public function handle(Request $request, Closure $next, ?string $permission = null)
    {
        $user = $request->user();
        abort_if(!$user, 403, 'Anda belum login.');

        if ($user->isSuperAdmin()) return $next($request);

        $company = $user->company;
        abort_if(!$company, 403, 'Akun ini tidak terhubung dengan company.');

        $routeName = $request->route()->getName();
        $whiteList = ['dashboard', 'profile.edit', 'profile.update', 'profile.destroy', 'impersonate.take', 'impersonate.leave'];
        if (in_array($routeName, $whiteList)) return $next($request);

        $subscription = $company->activeSubscription;
        $isExpired = $subscription && $subscription->ends_at->isPast();

        $dbPermission = Permission::with('module')->where('route_name', $routeName)->first();
        if ($dbPermission) {
            if ($company->hasAccess($dbPermission->name)) return $next($request);
            abort_if($isExpired, 403, "Masa langganan Paket " . ($subscription->plan->name ?? '') . " Anda telah berakhir. Silakan lakukan upgrade atau perpanjangan.");
            abort(403, "Fitur ini tidak tersedia dalam paket Anda.");
        }

        if ($permission && $company->hasAccess($permission)) return $next($request);
        abort(403, "Rute ini ({$routeName}) belum terdaftar dalam sistem akses kontrol.");
    }
}