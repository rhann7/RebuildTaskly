<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Permission\Traits\HasRoles;

class Company extends Model
{
    use HasFactory, HasRoles;

    protected $guard_name = 'web';

    protected $fillable = [
        'user_id', 
        'company_category_id', 
        'name', 
        'slug', 
        'email', 
        'phone', 
        'logo', 
        'address', 
        'is_active',
        'reason'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(CompanyCategory::class, 'company_category_id');
    }

    public function workspaces()
    {
        return $this->hasMany(Workspace::class);
    }

    public function appeals()
    {
        return $this->hasMany(CompanyAppeal::class);
    }

    public function appealLogs()
    {
        return $this->hasMany(CompanyAppealLog::class)->latest();
    }

    public function subscription()
    {
        return $this->hasOne(Subscription::class)->where('status', 'active');
    }

    public function hasAccess($permissionName)
    {
        if (app('impersonate')->isImpersonating()) return true;

        $activeSub = $this->subscription()->where('status', 'active')->where('ends_at', '>', now())->first();
        if (!$activeSub) return false;

        return $activeSub->plan->modules()
            ->whereHas('permissions', function($q) use ($permissionName) {
                $q->where('name', $permissionName);
            })->exists();
    }
}