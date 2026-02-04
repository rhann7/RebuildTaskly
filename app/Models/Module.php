<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'type',
        'price',
        'description',
        'is_active',
    ];

    protected $casts = [
        'price'     => 'decimal:2',
        'is_active' => 'boolean',
    ];
    
    protected static function booted()
    {
        static::saving(function ($module) {
            if ($module->isDirty('name')) $module->slug = str($module->name)->slug();
        });
    }

    public const TYPE_STANDARD = 'standard';
    public const TYPE_ADDON = 'addon';

    public function isAddon(): bool
    {
        return $this->type === self::TYPE_ADDON;
    }

    public function isStandard(): bool
    {
        return $this->type === self::TYPE_STANDARD;
    }

    public function permissions()
    {
        return $this->hasMany(Permission::class, 'module_id');
    }

    public function plans()
    {
        return $this->belongsToMany(Plan::class, 'plan_module');
    }
}