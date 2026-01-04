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
        'company_owner_id', 
        'company_category_id', 
        'name', 
        'slug', 
        'email', 
        'phone', 
        'logo', 
        'address', 
        'is_active'
    ];

    public function companyOwner()
    {
        return $this->belongsTo(CompanyOwner::class, 'company_owner_id');
    }

    public function companyCategory()
    {
        return $this->belongsTo(CompanyCategory::class, 'company_category_id');
    }

    public function hasFeature(string $permissionName)
    {
        return $this->hasPermissionTo($permissionName);
    }
}