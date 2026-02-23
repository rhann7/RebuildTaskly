<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Clear Cached Permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // 2. Create Roles
        $superAdminRole = Role::firstOrCreate(['name' => 'super-admin']);
        $companyRole = Role::firstOrCreate(['name' => 'company']);
        $managerRole = Role::firstOrCreate(['name' => 'manager']); // Added manager role
        $employeeRole = Role::firstOrCreate(['name' => 'employee']);

        // 3. Define Permissions (Based on your images, ensuring sequential IDs if starting fresh)
        // I will use Spatie's Permission model to create these so it handles the guard_name automatically,
        // but I will add the extra custom columns (route_path, isMenu, price, etc.)
        
        $permissionsData = [
            [
                'name' => 'access-workspaces',
                'route_path' => '/workspaces',
                'route_name' => 'workspaces.index',
                'controller_action' => null,
                'icon' => 'Building',
                'isMenu' => 1,
                'isGroup' => 1,
                'group_routes' => json_encode(["workspaces.*"]),
                'type' => 'general',
                'scope' => 'company',
                'price' => 17880000.00,
            ],
            [
                'name' => 'project-global',
                'route_path' => '/projects',
                'route_name' => 'projects.global',
                'controller_action' => 'App\Http\Controllers\ProjectManagement\ProjectController@global',
                'icon' => 'Book',
                'isMenu' => 1,
                'isGroup' => 0,
                'group_routes' => null,
                'type' => 'general',
                'scope' => 'company',
                'price' => 120000.00,
            ],
            [
                'name' => 'team-index',
                'route_path' => '/team',
                'route_name' => 'team.index',
                'controller_action' => 'App\Http\Controllers\TeamController@index',
                'icon' => 'Users',
                'isMenu' => 1,
                'isGroup' => 0,
                'group_routes' => null,
                'type' => 'general',
                'scope' => 'company',
                'price' => 120000.00,
            ],
            [
                'name' => 'View-Timesheet',
                'route_path' => '/timesheets',
                'route_name' => 'timesheets.index',
                'controller_action' => 'App\Http\Controllers\Timesheets\TimesheetController@index',
                'icon' => 'Clock',
                'isMenu' => 1,
                'isGroup' => 0,
                'group_routes' => null,
                'type' => 'general',
                'scope' => 'company',
                'price' => 120000.00, // Adjusted price for standard menu item
            ],
            [
                'name' => 'Timesheet-Store',
                'route_path' => '/timesheets',
                'route_name' => 'timesheets.store',
                'controller_action' => 'App\Http\Controllers\Timesheets\TimesheetController@store',
                'icon' => null,
                'isMenu' => 0,
                'isGroup' => 0,
                'group_routes' => null,
                'type' => 'general',
                'scope' => 'company',
                'price' => 0.00, // Background actions are usually free
            ],
            [
                'name' => 'Timesheet-time-update',
                'route_path' => '/timesheets/{id}/time',
                'route_name' => 'timesheets.time.update',
                'controller_action' => 'App\Http\Controllers\Timesheets\TimesheetController@updateTime',
                'icon' => null,
                'isMenu' => 0,
                'isGroup' => 0,
                'group_routes' => null,
                'type' => 'general',
                'scope' => 'company',
                'price' => 0.00,
            ],
            [
                'name' => 'Timesheet-TimeEntry-Delete',
                'route_path' => '/timesheets/{timesheet}',
                'route_name' => 'timesheets.destroy',
                'controller_action' => 'App\Http\Controllers\Timesheets\TimesheetController@destroy',
                'icon' => null,
                'isMenu' => 0,
                'isGroup' => 0,
                'group_routes' => null,
                'type' => 'general',
                'scope' => 'company',
                'price' => 0.00, // Action route
            ],
        ];

        $now = Carbon::now();
        $allPermissionNames = [];

        foreach ($permissionsData as $data) {
            // Using DB::table()->updateOrInsert to handle custom columns safely
            DB::table('permissions')->updateOrInsert(
                ['name' => $data['name'], 'guard_name' => 'web'],
                array_merge($data, [
                    'created_at' => $now,
                    'updated_at' => $now,
                ])
            );
            $allPermissionNames[] = $data['name'];
        }

        // Re-fetch created permissions to sync them to roles
        $permissions = Permission::whereIn('name', $allPermissionNames)->get();

        // 4. Assign ALL permissions to Super Admin and Company
        $superAdminRole->syncPermissions($permissions);
        $companyRole->syncPermissions($permissions);

        // Optional: Assign specific permissions to Manager
        // Managers usually need to view, add, edit, and delete timesheets
        $managerPermissions = Permission::whereIn('name', [
            'project-global', 
            'team-index', 
            'View-Timesheet', 
            'Timesheet-Store', 
            'Timesheet-time-update', 
            'Timesheet-TimeEntry-Delete'
        ])->get();
        
        $managerRole->syncPermissions($managerPermissions);

        // 5. Create Super Admin User
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@taskly.com'],
            [
                'name'              => 'Super Admin',
                'password'          => Hash::make('password'),
                'email_verified_at' => now(),
                'remember_token'    => Str::random(10),
            ]
        );
        
        $superAdmin->syncRoles(['super-admin']);
    }
}