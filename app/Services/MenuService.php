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

        $menu = [
            [
                'title'    => 'Dashboard',
                'href'     => '/dashboard',
                'icon'     => 'LayoutGrid',
                'isActive' => $request->routeIs('dashboard'),
            ]
        ];

        if ($user->isSuperAdmin()) return array_merge($menu, $this->getSuperAdminMenus($request));

        return array_merge($menu, $this->getDynamicCompanyMenus($request, $user));
    }

    public function getSuperAdminMenus(Request $request)
    {
        return [
            [
                'title'    => 'Company Management',
                'href'     => '#',
                'icon'     => 'Building2',
                'isActive' => $request->routeIs('company-management.*'),
                'items'    => [
                    ['title' => 'Categories', 'href' => url('/company-management/categories'), 'isActive' => $request->routeIs('company-management.categories.*')],
                    ['title' => 'Companies', 'href' => url('/company-management/companies'), 'isActive' => $request->routeIs('company-management.companies.*')],
                    ['title' => 'Appeals', 'href' => url('/company-management/appeals'), 'isActive' => $request->routeIs('company-management.appeals.*')],
                ]
            ],
            [
                'title'    => 'Access Control',
                'href'     => '#',
                'icon'     => 'ShieldCheck',
                'isActive' => $request->routeIs('access-control.*'),
                'items'    => [
                    ['title' => 'Permissions', 'href' => url('/access-control/permissions'), 'isActive' => $request->routeIs('access-control.permissions.*')],
                    ['title' => 'Company Access', 'href' => url('/access-control/company-access'), 'isActive' => $request->routeIs('access-control.company-access.*')],
                ]
            ],
            [
                'title'    => 'Workspaces Management', 
                'href'     => '/workspaces', 
                'icon'     => 'Briefcase', 
                'isActive' => $request->routeIs('workspaces.index'),
            ]
        ];
    }

    public function getDynamicCompanyMenus(Request $request, $user)
    {
        $company = $user->company;
        $up = $user->getAllPermissions();
        $cp = $company 
            ? cache()->remember("company-{$company->id}-permissions", 86400, fn() => $company->getAllPermissions()) 
            : collect();
        
        $permissions = $up->merge($cp)
            ->where('isMenu', true)
            ->unique('id')
            ->sortBy('id');
    
        $dynamicMenu = [];
        foreach ($permissions as $p) {
            $dynamicMenu[] = [
                'title'    => Str::headline($p->name),
                'href'     => $p->route_name && Route::has($p->route_name) ? route($p->route_name) : url($p->route_path ?? '#'),
                'icon'     => $p->icon ?? 'Circle',
                'isActive' => $p->route_name ? $request->routeIs($p->route_name . '*') : false,
            ];
        }

        return $dynamicMenu;
    }
}