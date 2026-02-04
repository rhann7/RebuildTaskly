<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'price_monthly',
        'price_yearly',
        'is_active',
        'is_basic',
    ];

    protected $casts = [
        'price_monthly' => 'decimal:2',
        'price_yearly'  => 'decimal:2',
        'is_active'     => 'boolean',
        'is_basic'      => 'boolean',
    ];

    protected static function booted()
    {
        static::saving(function ($module) {
            if ($module->isDirty('name')) $module->slug = str($module->name)->slug();
        });
    }

    public function modules()
    {
        return $this->belongsToMany(Module::class, 'plan_module');
    }
}