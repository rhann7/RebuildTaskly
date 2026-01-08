<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $stats = [];
        $activities = [];

        if ($user->hasRole('super-admin')) {
            $stats = [
                [
                    'title' => 'Total Companies',
                    'value' => Company::count(),
                    'icon'  => 'Building2',
                    'desc'  => 'Registered companies'
                ],
                [
                    'title' => 'Total Permissions',
                    'value' => Permission::count(),
                    'icon'  => 'ShieldCheck',
                    'desc'  => 'Available features'
                ],
                [
                    'title' => 'Dummy Card',
                    'value' => 0, 
                    'icon'  => 'ShieldAlert',
                    'desc'  => 'Dummy description'
                ]
            ];

            $activities = Company::latest()->take(5)->get()->map(function($company) {
                return [
                    'title' => 'New Company Registration',
                    'desc'  => "{$company->name} joined the platform.",
                    'time'  => $company->created_at->diffForHumans(),
                ];
            });

        } else {
            $company = $user->companyOwner?->company;

            if ($company) {
                $company->load('permissions');
                
                $stats = [
                    [
                        'title' => 'Active Features',
                        'value' => $company->permissions->count(), 
                        'icon'  => 'Zap',
                        'desc'  => 'Features enabled for you'
                    ],
                    [
                        'title' => 'Dummy Card',
                        'value' => 0, 
                        'icon'  => 'Users',
                        'desc'  => 'Dummy description'
                    ],
                    [
                        'title' => 'Dummy Card',
                        'value' => 0,
                        'icon'  => 'Briefcase',
                        'desc'  => 'Dummy description'
                    ]
                ];
            }
        }

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'activities' => $activities
        ]);
    }
}