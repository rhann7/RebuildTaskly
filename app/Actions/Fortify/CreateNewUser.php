<?php

namespace App\Actions\Fortify;

use App\Models\Company;
use App\Models\CompanyOwner;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;
use Spatie\Permission\Models\Permission;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    public function create(array $input)
    {
        Validator::make($input, [
            'email'               => ['required', 'string', 'email', 'max:255', Rule::unique(User::class)],
            'password'            => $this->passwordRules(),
            'company_owner_name'  => ['required', 'string', 'max:255'],
            'company_name'        => ['required', 'string', 'max:255'],
            'company_address'     => ['required', 'string', 'max:255'],
            'company_phone'       => ['required', 'string', 'max:20'],
            'company_category_id' => ['required', 'exists:company_categories,id'],
        ])->validate();

        return DB::transaction(function () use ($input) {
            $user = User::create([
                'name'              => $input['company_name'],
                'email'             => $input['email'],
                'password'          => Hash::make($input['password']),
                'email_verified_at' => now(),
            ])->assignRole('company');

            $owner = CompanyOwner::create([
                'user_id' => $user->id,
                'name'    => $input['company_owner_name'],
            ]);

            $slug = Str::slug($input['company_name']);
            if (Company::where('slug', $slug)->exists()) {
                $slug = $slug . '-' . Str::lower(Str::random(5));
            }

            $company = new Company();
            $company->forceFill([
                'company_owner_id'    => $owner->id,
                'company_category_id' => $input['company_category_id'],
                'name'                => $input['company_name'],
                'slug'                => $slug,
                'email'               => $input['email'],
                'address'             => $input['company_address'],
                'phone'               => $input['company_phone'],
                'is_active'           => true,
            ])->save();
            
            $permissions = Permission::where('type', 'general')
                ->where('isGroup', false)
                ->whereIn('scope', ['company', 'workspace'])
                ->get();
                
            if ($permissions->isNotEmpty()) $company->syncPermissions($permissions);
            
            return $user;
        });
    }
}