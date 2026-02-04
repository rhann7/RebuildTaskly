<?php

namespace Database\Seeders;

use App\Models\CompanyCategory;
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