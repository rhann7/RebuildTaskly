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
        'is_active'
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

    public function hasPermission(string $permissionName)
    {
        return $this->hasPermissionTo($permissionName);
    }
}