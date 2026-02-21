<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Company;
use App\Models\Workspace;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
       Permission::query()->forgetCachedPermissions();

        // --- 1. DATA PERMISSIONS DENGAN METADATA MENU ---
        $menuData = [
            [
                'name' => 'view-dashboard',
                'route_name' => 'dashboard',
                'route_path' => '/dashboard',
                'controller_action' => 'DashboardController@index',
                'icon' => 'LayoutDashboard',
                'is_menu' => true
            ],
            [
                'name' => 'view-timesheets',
                'route_name' => 'timesheets.index',
                'route_path' => '/timesheets',
                'controller_action' => 'TimesheetController@index',
                'icon' => 'Clock',
                'is_menu' => true
            ],
            [
                'name' => 'access-workspaces',
                'route_name' => 'workspaces.index',
                'route_path' => '/workspaces',
                'controller_action' => 'WorkspaceController@index',
                'icon' => 'Briefcase',
                'is_menu' => true
            ],
            [
                'name' => 'create-timesheets',
                'route_name' => null,
                'route_path' => null,
                'controller_action' => null,
                'icon' => null,
                'is_menu' => false
            ],
        ];

        foreach ($menuData as $data) {
            Permission::firstOrCreate(['name' => $data['name']], $data);
        }

        // --- 2. ROLES ---
        $roleSuperAdmin = Role::firstOrCreate(['name' => 'super-admin']);
        $roleCompany    = Role::firstOrCreate(['name' => 'company']);
        $roleEmployee   = Role::firstOrCreate(['name' => 'employee']);

        // Assign
        $roleSuperAdmin->syncPermissions(Permission::all());
        $roleCompany->syncPermissions(Permission::all()); // Owner dapet semua menu
        $roleEmployee->syncPermissions(['view-dashboard', 'view-timesheets', 'create-timesheets']);

        // --- 3. CREATE OWNER & COMPANY ---
        $owner = User::create([
            'name' => 'Sada Owner',
            'email' => 'owner@sada.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $owner->assignRole($roleCompany);

        $company = Company::create([
            'name' => 'Sada Technology',
            'slug' => 'sada-tech',
            'company_owner_id' => $owner->id,
        ]);
        $owner->update(['company_id' => $company->id]);

        // --- 4. CREATE WORKSPACE ---
        Workspace::create([
            'name' => 'Main Development',
            'slug' => 'main-dev',
            'company_id' => $company->id,
            'manager_id' => $owner->id,
            'status' => 'active'
        ]);
    }
}