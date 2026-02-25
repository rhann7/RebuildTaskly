<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Lab404\Impersonate\Models\Impersonate;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, HasRoles, Impersonate, Notifiable, TwoFactorAuthenticatable, HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'password',
        'email_verified_at',
        'remember_token'
    ];

    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token'
    ];

    protected function casts(): array
    {
        return [
            'password'                => 'hashed',
            'email_verified_at'       => 'datetime',
            'two_factor_confirmed_at' => 'datetime'
        ];
    }

    public function company()
    {
        return $this->hasOne(Company::class);
    }

    public function appealLogs()
    {
        return $this->hasMany(CompanyAppealLog::class)->latest();
    }

    public function isSuperAdmin()
    {
        return $this->hasRole('super-admin');
    }

    public function canImpersonate()
    {
        return $this->isSuperAdmin();
    }

    public function canBeImpersonated()
    {
        return !$this->isSuperAdmin();
    }

    public function ticketMessage()
    {
        return $this->hasMany(TicketMessage::class);
    }
    public function ticketComment()
    {
        return $this->hasMany(TicketComment::class);
    }
}
