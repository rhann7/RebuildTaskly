<?php

namespace App\Actions\Fortify;

use App\Models\Company;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    public function create(array $input)
    {
        Validator::make($input, [
            'email'               => ['required', 'string', 'email', 'max:255', Rule::unique(User::class)],
            'password'            => $this->passwordRules(),
            'company_logo'        => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
            'company_name'        => ['required', 'string', 'max:255'],
            'company_address'     => ['nullable', 'string', 'max:255'],
            'company_phone'       => ['nullable', 'string', 'max:20'],
            'company_category_id' => ['required', 'exists:company_categories,id'],
        ])->validate();

        return DB::transaction(function () use ($input) {
            $user = User::create([
                'name'              => $input['company_name'],
                'email'             => $input['email'],
                'password'          => Hash::make($input['password']),
                'email_verified_at' => now(),
            ])->assignRole('company');

            $logoPath = null;
            if (isset($input['company_logo']) && $input['company_logo'] instanceof UploadedFile) {
                $path = $input['company_logo']->store('logos', 'public');
                $logoPath = basename($path);
            }

            $slug = Str::slug($input['company_name']) . '-' . Str::lower(Str::random(5));

            $company = Company::create([
                'user_id'             => $user->id,
                'company_category_id' => $input['company_category_id'],
                'name'                => $input['company_name'],
                'slug'                => $slug,
                'logo'                => $logoPath,
                'email'               => $input['email'],
                'address'             => $input['company_address'] ?? null,
                'phone'               => $input['company_phone'] ?? null,
                'is_active'           => true,
            ]);
        });
    }
}