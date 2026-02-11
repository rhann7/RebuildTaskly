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

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class, 'company_id');
    }

    public function hasPermission(string $permissionName)
    {
        return $this->hasPermissionTo($permissionName);
    }

    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)
            ->where('status', 'active')
            ->latestOfMany();
    }

    public function hasAccess(string $permissionName): bool
    {
        $activeSub = $this->activeSubscription;
        if (!$activeSub || ($activeSub->ends_at && $activeSub->ends_at->isPast())) return false;

        return $activeSub->plan()
            ->where('is_active', true)
            ->whereHas('modules', function ($q) use ($permissionName) {
                $q->where('modules.is_active', true)
                ->whereHas('permissions', function ($p) use ($permissionName) {
                    $p->where('name', $permissionName);
                });
            })->exists();
    }
}