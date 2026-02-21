<?php

namespace App\Services;

use Illuminate\Http\Request;
use App\Models\Permission;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

class MenuService
{
    public function getSidebarMenu(Request $request)
    {
        $user = $request->user();
        if (!$user) return [];

        $menu = [[
            'title'    => 'Dashboard',
            'href'     => route('dashboard'),
            'icon'     => 'LayoutGrid',
            'isActive' => $request->routeIs('dashboard'),
        ]];

        if ($user->isSuperAdmin()) return array_merge($menu, $this->getSuperAdminMenus($request));
        return array_merge($menu, $this->getDynamicCompanyMenus($request, $user));
    }

    private function getSuperAdminMenus(Request $request)
    {
        return [
            [
                'title'    => 'Company Management',
                'icon'     => 'Building2',
                'isActive' => $request->is('company-management*'),
                'items'    => [
                    ['title' => 'Categories', 'href' => route('company-management.categories.index'), 'isActive' => $request->routeIs('company-management.categories.*')],
                    ['title' => 'Companies', 'href' => route('company-management.companies.index'), 'isActive' => $request->routeIs('company-management.companies.*')],
                    ['title' => 'Appeals', 'href' => route('company-management.appeals.index'), 'isActive' => $request->routeIs('company-management.appeals.*')],
                ]
            ],
            [
                'title'    => 'Access Control',
                'icon'     => 'ShieldCheck',
                'isActive' => $request->is('access-control*'),
                'items'    => [
                    ['title' => 'Permissions', 'href' => route('access-control.permissions.index'), 'isActive' => $request->routeIs('access-control.permissions.*')],
                ]
            ],
            [
                'title'    => 'Product Management',
                'icon'     => 'Gem',
                'isActive' => $request->is('product-management*'),
                'items'    => [
                    ['title' => 'Modules', 'href' => route('product-management.modules.index'), 'isActive' => $request->routeIs('product-management.modules.*')],
                    ['title' => 'Plans', 'href' => route('product-management.plans.index'), 'isActive' => $request->routeIs('product-management.plans.*')],
                ]
            ],
            [
                'title'    => 'Workspaces Management', 
                'href'     => route('workspaces.index'), 
                'icon'     => 'Briefcase', 
                'isActive' => $request->routeIs('workspaces.index'),
            ]
        ];
    }

    private function getDynamicCompanyMenus(Request $request, $user)
    {
        $company = $user->company;
        if (!$company) return [];

        $subscription = $company->subscription;
        if (!$subscription) return [];

        $allowedPermissions = Permission::query()
            ->where('isMenu', true)
            ->whereHas('module.plans', function ($query) use ($subscription) {
                $query->where('plans.id', $subscription->plan_id);
            })
            ->with('module')
            ->get();

        $groupedPermissions = $allowedPermissions->groupBy(fn($p) => $p->module->name ?? 'Lainnya');
        $dynamicMenu = [];

        foreach ($groupedPermissions as $moduleName => $permissions) {
            $items = [];
            foreach ($permissions as $p) {
                if (Route::has($p->route_name)) {
                    $items[] = [
                        'title'    => Str::headline($p->name),
                        'href'     => route($p->route_name),
                        'icon'     => $p->icon ?? 'Circle',
                        'isActive' => $request->routeIs($p->route_name . '*'),
                    ];
                }
            }

            if (count($items) === 1) {
                $dynamicMenu[] = [
                    'title'    => $items[0]['title'],
                    'href'     => $items[0]['href'],
                    'icon'     => $permissions->first()->module->icon ?? $items[0]['icon'],
                    'isActive' => $items[0]['isActive'],
                ];
            } elseif (count($items) > 1) {
                $dynamicMenu[] = [
                    'title'    => $moduleName,
                    'icon'     => $permissions->first()->module->icon ?? 'Folder',
                    'items'    => $items,
                    'isActive' => collect($items)->contains('isActive', true),
                ];
            }
        }

        return $dynamicMenu;
    }
}