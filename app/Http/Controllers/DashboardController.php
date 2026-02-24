<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\ProjectManagement\Project; 
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $stats = [];
        $activities = collect(); // Pakai collect biar aman pas di-map

        if ($user->hasRole('super-admin')) {
            // --- STATS SUPER ADMIN ---
            $stats = [
                [
                    'title' => 'Total Companies',
                    'value' => Company::count(),
                    'icon'  => 'Building2',
                    'desc'  => 'Registered entities'
                ],
                [
                    'title' => 'Total Permissions',
                    'value' => Permission::count(),
                    'icon'  => 'ShieldCheck',
                    'desc'  => 'Available features'
                ],
                [
                    'title' => 'Global Users',
                    'value' => User::count(), 
                    'icon'  => 'Users',
                    'desc'  => 'Total personnel'
                ]
            ];

            // --- LOG SUPER ADMIN (Company Baru) ---
            $activities = Company::latest()->take(5)->get()->map(function($company) {
                return [
                    'title' => 'New Company Registration',
                    'desc'  => "Unit [{$company->name}] has been onboarded to the system.",
                    'time'  => $company->created_at->diffForHumans(),
                ];
            });

        } else {
            // --- LOGIC FOR COMPANY / MANAGER ---
            $companyId = $user->company_id;

            if ($companyId) {
                // Stats Real Time
                $stats = [
                    [
                        'title' => 'Active Projects',
                        'value' => Project::whereHas('workspace', fn($q) => $q->where('company_id', $companyId))->count(), 
                        'icon'  => 'Briefcase',
                        'desc'  => 'Operations in progress'
                    ],
                    [
                        'title' => 'Team Strength',
                        'value' => User::where('company_id', $companyId)->count(), 
                        'icon'  => 'Users',
                        'desc'  => 'Deployed personnel'
                    ],
                    [
                        'title' => 'System Features',
                        'value' => Permission::count(), // Atau sesuaikan dengan fitur paket mereka
                        'icon'  => 'Zap',
                        'desc'  => 'Authorized capabilities'
                    ]
                ];

                // --- OPERATION LOGS (Project Terbaru di Perusahaan Terkait) ---
                $activities = Project::with('workspace')
                    ->whereHas('workspace', fn($q) => $q->where('company_id', $companyId))
                    ->latest()
                    ->take(5)
                    ->get()
                    ->map(function($project) {
                        return [
                            'title' => 'Project Deployment',
                            'desc'  => "Operation [{$project->name}] is now live in {$project->workspace->name}.",
                            'time'  => $project->created_at->diffForHumans(),
                        ];
                    });
            }
        }

        return Inertia::render('dashboard', [
            'stats' => $stats,
            // Pastikan kirim data yang udah di-map, kalo kosong kirim array kosong
            'activities' => $activities->toArray() 
        ]);
    }
}