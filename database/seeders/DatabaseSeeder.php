<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\CompanyCategory;
use App\Models\Module;
use App\Models\Permission;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        Role::firstOrCreate(['name' => 'super-admin']);
        Role::firstOrCreate(['name' => 'company']);

        $module = Module::create([
            'name'        => 'Workspace Management',
            'type'        => 'standard',
            'scope'       => 'company',
            'description' => 'Workspace Management Features',
            'is_active'   => true,
        ]);

        Permission::create([
            'module_id'  => $module->id,
            'name'       => 'view-workspaces',
            'route_name' => 'workspaces.index',
            'icon'       => 'Briefcase',
            'isMenu'     => true,
        ]);

        $plan = Plan::create([
            'name'                     => 'Free Plan',
            'price_monthly'            => 0,
            'discount_monthly_percent' => 0,
            'price_yearly'             => null,
            'discount_yearly_percent'  => 0,
            'is_free'                  => true,
            'is_active'                => true,
            'is_yearly'                => false,
        ]);
        $plan->modules()->sync($module->id);

        $categories = [
            'Finance',
            'Design',
            'Technology',
            'Healthcare',
            'Construction',
            'Digital Marketing',
        ];

        foreach ($categories as $category) {
            CompanyCategory::firstOrCreate([
                'name' => $category,
                'slug' => Str::slug($category),
            ]);
        }

        User::firstOrCreate(
            ['email' => 'superadmin@taskly.com'],
            [
                'name'              => 'Super Admin',
                'password'          => Hash::make('password'),
                'email_verified_at' => now(),
                'remember_token'    => null,
            ]
        )->syncRoles('super-admin');
        
        $company = User::firstOrCreate(
            ['email' => 'starbhaktech@gmail.com'],
            [
                'name'              => 'Starbhak Tech',
                'password'          => Hash::make('password'),
                'email_verified_at' => now(),
                'remember_token'    => null,
            ]
        )->syncRoles('company');

        Company::firstOrCreate(
            ['email' => 'starbhaktech@gmail.com'],
            [
                'company_category_id' => CompanyCategory::where('name', 'Technology')->first()->id,
                'user_id'             => $company->id,
                'name'                => 'Starbhak Tech',
                'slug'                => Str::slug('Starbhak Tech') . '-' . Str::lower(Str::random(5)),
                'phone'               => '0896-1515-9699',
                'logo'                => null,
                'address'             => 'Jl. Setya Bhakti No. 713',
                'is_active'           => true,
            ]
        );
    }
}