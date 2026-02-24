<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\CompanyCategory;
use App\Models\Module;
use App\Models\Permission;
use App\Models\Plan;
use App\Models\Subscription;
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

        $workspaceModule = Module::create([
            'name'        => 'Workspace Management',
            'type'        => 'standard',
            'scope'       => 'company',
            'description' => 'Workspace Management Features',
            'is_active'   => true,
        ]);

        $invoiceModule = Module::create([
            'name'        => 'Invoice Management',
            'type'        => 'standard',
            'scope'       => 'company',
            'description' => 'Invoice Management Features',
            'is_active'   => true,
        ]);

        $workspacePermissions = [
            'view-workspaces'  => ['route' => 'workspaces.index',   'isMenu' => true],
            'create-workspace' => ['route' => 'workspaces.store',   'isMenu' => false],
            'show-workspace'   => ['route' => 'workspaces.show',    'isMenu' => false],
            'edit-workspace'   => ['route' => 'workspaces.update',  'isMenu' => false],
            'delete-workspace' => ['route' => 'workspaces.destroy', 'isMenu' => false],
        ];

        foreach ($workspacePermissions as $name => $config) {
            Permission::create([
                'module_id'  => $workspaceModule->id,
                'name'       => $name,
                'route_name' => $config['route'],
                'icon'       => 'Briefcase',
                'isMenu'     => $config['isMenu'],
            ]);
        }

        Permission::create([
            'module_id'  => $invoiceModule->id,
            'name'       => 'view-invoices',
            'route_name' => 'invoices.index',
            'icon'       => 'Receipt',
            'isMenu'     => true,
        ]);

        $freePlan = Plan::create([
            'name'           => 'Free Plan',
            'slug'           => 'free-plan',
            'description'    => 'Get started with basic features.',
            'price'          => 0,
            'original_price' => null,
            'duration'       => 30,
            'is_active'      => true,
        ]);
        $freePlan->modules()->sync($invoiceModule->id);

        $monthlyPlan = Plan::create([
            'name'           => 'Enterprise Plan',
            'slug'           => 'enterprise-plan',
            'description'    => 'Best for large organizations with advanced needs.',
            'price'          => 150000,
            'original_price' => null,
            'duration'       => 30,
            'is_active'      => true,
        ]);
        $monthlyPlan->modules()->sync([$workspaceModule->id, $invoiceModule->id]);

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

        $companyAccount = Company::where('email', 'starbhaktech@gmail.com')->first();

        Subscription::firstOrCreate(
            ['company_id' => $companyAccount->id],
            [
                'plan_id'    => $freePlan->id,
                'invoice_id' => null,
                'plan_name'  => $freePlan->name,
                'starts_at'  => now(),
                'ends_at'    => now()->addDays($freePlan->duration),
                'status'     => 'active',
            ]
        );
    }
}