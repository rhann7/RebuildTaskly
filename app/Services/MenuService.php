<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

class MenuService
{
    public function getSidebarMenu(Request $request)
    {
        $user = $request->user();
        if (!$user) return [];

        $company = $user->company;
        $menu = [];

        $menu[] = [
            'title'    => 'Dashboard',
            'href'     => '/dashboard',
            'icon'     => 'LayoutGrid',
            'isActive' => $request->routeIs('dashboard'),
        ];

        if ($user->isSuperAdmin()) {
            $menu[] = [
                'title'    => 'Company Management',
                'href'     => '#',
                'icon'     => 'Building2',
                'isActive' => $request->routeIs('company-management.*'),
                'items'    => [
                    ['title' => 'Categories', 'href' => '/company-management/categories', 'isActive' => $request->routeIs('company-management.categories.*')],
                    ['title' => 'Companies', 'href' => '/company-management/companies', 'isActive' => $request->routeIs('company-management.companies.*')],
                    ['title' => 'Appeals', 'href' => '/company-management/appeals', 'isActive' => $request->routeIs('company-management.appeals.*')],
                ]
            ];

            $menu[] = [
                'title'    => 'Access Control',
                'href'     => '#',
                'icon'     => 'ShieldCheck',
                'isActive' => $request->routeIs('access-control.*'),
                'items'    => [
                    ['title' => 'Permissions', 'href' => '/access-control/permissions', 'isActive' => $request->routeIs('access-control.permissions.*')],
                    ['title' => 'Company Access', 'href' => '/access-control/company-access', 'isActive' => $request->routeIs('access-control.company-access.*')],
                ]
            ];

            $menu[] = [
                'title'    => 'Workspaces Management',
                'href'     => '/workspaces',
                'icon'     => 'Briefcase',
                'isActive' => $request->routeIs('workspaces.index'),
            ];

            return $menu;
        }

        $up = $user->getAllPermissions();
        $cp = $company 
            ? cache()->remember("company-{$company->id}-permissions", 60, fn() => $company->getAllPermissions()) 
            : collect();
        
        $permissions = $up->merge($cp)
            ->where('isMenu', true)
            ->unique('id')
            ->sortBy('id');

        foreach ($permissions as $p) {
            $href = '#';
            $isActive = false;
            
            $groupRoutes = is_array($p->group_routes) 
                ? $p->group_routes 
                : json_decode($p->group_routes ?? '[]', true);

            if ($p->route_name && Route::has($p->route_name . '.index')) {
                $href = route($p->route_name . '.index');
            } elseif (!empty($groupRoutes)) {
                $firstPattern = str_replace('.*', '.index', $groupRoutes[0]);
                $href = Route::has($firstPattern) ? route($firstPattern) : '#';
            } elseif ($p->route_path) {
                $href = url($p->route_path);
            }

            if (!empty($groupRoutes)) {
                foreach ($groupRoutes as $pattern) {
                    if ($request->routeIs($pattern)) {
                        $isActive = true;
                        break;
                    }
                }
            } else {
                $isActive = $p->route_name ? $request->routeIs($p->route_name . '.*') : false;
            }

            $menu[] = [
                'title'    => Str::headline($p->name),
                'href'     => $href,
                'icon'     => $p->icon ?? 'Circle',
                'isActive' => $isActive,
            ];
        }

        return $menu;
    }
}