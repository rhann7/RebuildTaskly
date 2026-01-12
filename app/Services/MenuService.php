<?php

namespace App\Services;

use Illuminate\Http\Request;

class MenuService
{
    public function getSidebarMenu(Request $request)
    {
        $user = $request->user();
        if (!$user) return [];

        $company = $user->companyOwner->company ?? null;

        $up = $user->getAllPermissions()->pluck('name');
        $cp = $company 
            ? cache()->remember("company-{$company->id}-permissions", 3600, fn() => $company->getAllPermissions()->pluck('name')) 
            : collect();
        $ap = $up->merge($cp)->unique();

        $menu = [];
        $menu[] = [
            'title'    => 'Dashboard',
            'href'     => '/dashboard',
            'icon'     => 'LayoutGrid',
            'isActive' => $request->routeIs('dashboard'),
        ];

        if ($user->hasRole('super-admin')) {
            $menu[] = [
                'title' => 'Company Management',
                'href' => '#',
                'icon' => 'Building2',
                'isActive' => $request->routeIs('company-management.*'),
                'items' => [
                    [
                        'title' => 'Categories', 
                        'href' => '/company-management/categories', 
                        'isActive' => $request->routeIs('company-management.categories.*')
                    ],
                    [
                        'title' => 'Company List', 
                        'href' => '/company-management/companies', 
                        'isActive' => $request->routeIs('company-management.companies.*')
                    ],
                ]
            ];

            $menu[] = [
                'title' => 'Access Control',
                'href' => '#',
                'icon' => 'ShieldCheck',
                'isActive' => $request->routeIs('access-control.*'),
                'items' => [
                    [
                        'title' => 'Permission List', 
                        'href' => '/access-control/permissions', 
                        'isActive' => $request->routeIs('access-control.permissions.*')
                    ],
                    [
                        'title' => 'Company Access', 
                        'href' => '/access-control/company-access', 
                        'isActive' => $request->routeIs('access-control.company-access.*')
                    ],
                ]
            ];
        }

        if ($user->hasRole('company')) {
            if ($ap->contains('access-workspace')) {
                $menu[] = [
                    'title'    => 'Workspaces',
                    'href'     => '/workspaces',
                    'icon'     => 'Briefcase',
                    'isActive' => $request->routeIs('workspaces.*')
                ];
            }

            if ($ap->contains('view-analytics')) {
                $menu[] = [
                    'title'    => 'Analytics',
                    'href'     => '/view-analytics',
                    'icon'     => 'Activity',
                ];
            }
        }

        return $menu;
    }
}