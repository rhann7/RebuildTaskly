<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Lab404\Impersonate\Models\Impersonate;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, HasRoles, Impersonate, Notifiable, TwoFactorAuthenticatable;

    protected $fillable = [
        'name', 
        'email', 
        'password',
    ];

    protected $hidden = [
        'password', 
        'remember_token',
        'two_factor_secret', 
        'two_factor_recovery_codes',
    ];
    
    protected function casts(): array
    {
        return [
            'password'                => 'hashed', 
            'email_verified_at'       => 'datetime', 
            'two_factor_confirmed_at' => 'datetime'
        ];
    }

    protected static function booted()
    {
        static::updated(function ($user) {
            if ($user->wasChanged('name')) {
                DB::table('companies')
                    ->whereIn('company_owner_id', function ($query) use ($user) {
                        $query->select('id')
                            ->from('company_owners')
                            ->where('user_id', $user->id);
                    })
                    ->update([
                        'name'       => $user->name,
                        'slug'       => Str::slug($user->name),
                        'updated_at' => now(),
                    ]);
            }
        });
    }

    public function companyOwner() { return $this->hasOne(CompanyOwner::class); }
    public function company()
    {
        return $this->hasManyThrough(
            Company::class, 
            CompanyOwner::class, 
            'user_id', 
            'company_owner_id', 
            'id', 
            'id'
        );
    }

    public function isSuperAdmin() { return $this->hasRole('super-admin'); }
    public function canImpersonate() { return $this->isSuperAdmin(); }
    public function canBeImpersonated() { return !$this->isSuperAdmin(); }
}