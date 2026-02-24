<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'original_price',
        'duration',
        'is_active',
    ];

    protected $casts = [
        'is_active'      => 'boolean',
        'price'          => 'decimal:2',
        'original_price' => 'decimal:2',
        'duration'       => 'integer',
    ];

    protected static function booted()
    {
        static::saving(function ($plan) {
            if ($plan->isDirty('name')) $plan->slug = str($plan->name)->slug();
        });
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function getIsFreeAttribute()
    {
        return $this->price <= 0;
    }

    public function getDurationLabelAttribute()
    {
        return $this->duration === 365 ? 'Tahunan' : 'Bulanan';
    }

    public function modules()
    {
        return $this->belongsToMany(Module::class, 'plan_module');
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }
}