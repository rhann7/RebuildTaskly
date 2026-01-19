<?php

namespace App\Services;

use Illuminate\Http\Request;

class MenuService
{
    public function getSidebarMenu(Request $request)
    {
        $user = $request->user();
        if (!$user) return [];

        $permissions = $user->getAllPermissions()->pluck('name');

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
                'title' => 'Article(s)',
                'href'  => '#',
                'icon'  => 'Newspaper',
                'isActive' => $request->routeIs('article-management.*'),
                'items' => [
                    [
                        'title' => 'Article',
                        'href'  => '/article-management/article',
                        'isActive' => $request->routeIs('article-management.article.*'),
                    ],
                    [
                        'title' => 'Article Category',
                        'href'  => '/article-management/category',
                        'isActive' => $request->routeIs('article-management.category.*'),
                    ],
                    [
                        'title' => 'Article Analytics',
                        'href'  => '/article-management/analytics',
                        'isActive' => $request->routeIs('article-management.analytics.*'),
                    ]
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
            if ($permissions->contains('access-workspace')) {
                $menu[] = [
                    'title'    => 'Workspaces',
                    'href'     => '/workspaces',
                    'icon'     => 'Briefcase',
                    'isActive' => $request->routeIs('workspaces.*')
                ];
            }
        }

        return $menu;
    }
}
