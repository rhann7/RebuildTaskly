<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'type',
        'price',
        'is_active',
    ];

    protected $casts = [
        'price'     => 'float',
        'is_active' => 'boolean',
    ];
    
    protected static function booted()
    {
        static::saving(function ($module) {
            $module->slug = str($module->name)->slug();
        });
    }

    public function permissions()
    {
        return $this->hasMany(Permission::class, 'module_id');
    }

    public function scopeAddons($query) {
        return $query->where('type', 'addon');
    }

    public function scopeStandard($query) {
        return $query->where('type', 'standard');
    }
}