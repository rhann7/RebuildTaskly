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
        abort_if(!$user, 403, 'Unauthorized.');

        $isImpersonating = app('impersonate')->isImpersonating();
        if ($isImpersonating && !$request->isMethod('GET') && !$request->isMethod('HEAD')) {
            if (!$request->routeIs('impersonate.leave')) abort(403, "Read-only mode: You are not allowed to modify data while impersonating.");
        }

        if ($user->isSuperAdmin() && !$isImpersonating) return $next($request);
        
        $company = $user->company;
        abort_if(!$company, 403, 'This account is not associated with any company.');

        $routeName = $request->route()->getName();
        $whiteList = ['dashboard', 'billings', 'impersonate.take', 'impersonate.leave', 'appeals.create', 'appeals.store', 'plans.pricing', 'invoices.show', 'invoices.create', 'invoices.store', 'invoices.payment', 'invoices.callback'];
        if (in_array($routeName, $whiteList)) return $next($request);

        $subscription = $company->activeSubscription;
        abort_if(!$subscription, 403, 'Your subscription has expired. Please renew or upgrade your plan to continue.');

        $dbPermission = Permission::with('module')->where('route_name', $routeName)->first();
        if ($dbPermission) {
            $module = $dbPermission->module;
            if ($module) {
                $workspaceParam = $request->route('workspace');

                if ($module->isCompanyScope() && $workspaceParam) abort(403, 'This feature is a company-level feature and cannot be accessed from within a Workspace.');

                if ($module->isWorkspaceScope()) {
                    if (!$workspaceParam) abort(403, 'This feature can only be accessed within a Workspace context.');

                    $workspaceId = is_object($workspaceParam) ? $workspaceParam->id : $workspaceParam;
                    $exists = $company->workspaces()->where('id', $workspaceId)->exists();

                    abort_if(!$exists, 403, 'Workspace not found or does not belong to your company.');
                }
            }

            return $next($request);
        }
        
        abort(403, 'Access denied. This feature is not registered in the access control system.');
    }
}