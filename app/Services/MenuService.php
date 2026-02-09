<?php

namespace App\Services;

use App\Models\Permission;
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
                ]
            ],
            [
                'title'    => 'Product Management',
                'href'     => '#',
                'icon'     => 'Gem',
                'isActive' => $request->routeIs('product-management.*'),
                'items'    => [
                    ['title' => 'Modules', 'href' => url('/product-management/modules'), 'isActive' => $request->routeIs('product-management.modules.*')],
                    ['title' => 'Plans', 'href' => url('/product-management/plans'), 'isActive' => $request->routeIs('product-management.plans.*')],
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
        if (!$company) return [];

        $allMenuPermissions = cache()->remember('all_menu_permissions', 86400, function() {
            return Permission::where('isMenu', true)->get();
        });

        $dynamicMenu = [];
        
        foreach ($allMenuPermissions as $p) {
            if ($company->hasAccess($p->name)) {
                if ($p->route_name && Route::has($p->route_name)) {
                    $dynamicMenu[] = [
                        'title'    => Str::headline($p->name),
                        'href'     => route($p->route_name),
                        'icon'     => $p->icon ?? 'Circle',
                        'isActive' => $request->routeIs($p->route_name . '*'),
                    ];
                }
            }
        }

        return $dynamicMenu;
    }
}