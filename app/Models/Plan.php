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
        'discount_monthly_percent',
        'discount_yearly_percent',
        'is_free',
        'is_yearly',
        'is_active',
    ];

    protected $casts = [
        'is_free'                  => 'boolean',
        'is_yearly'                => 'boolean',
        'is_active'                => 'boolean',
        'price_monthly'            => 'decimal:2',
        'price_yearly'             => 'decimal:2',
        'discount_monthly_percent' => 'integer',
        'discount_yearly_percent'  => 'integer',
    ];

    protected $appends = [
        'final_price_monthly',
        'final_price_yearly',
    ];

    protected static function booted()
    {
        static::saving(function ($plan) {
            if ($plan->isDirty('name')) $plan->slug = str($plan->name)->slug();

            if ($plan->is_free) {
                $plan->price_monthly = 0;
                $plan->price_yearly = 0;
                $plan->discount_monthly_percent = 0;
                $plan->discount_yearly_percent = 0;
                $plan->is_yearly = false;
            }

            if (!$plan->is_free && !$plan->is_yearly) {
                $plan->price_yearly = null;
                $plan->discount_yearly_percent = 0;
            }
        });
    }

    public function scopeFree($query)
    {
        return $query->where('is_free', true);
    }

    public function scopeYearly($query)
    {
        return $query->where('is_yearly', true);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public static function getFreePlan()
    {
        return self::where('is_free', true)->where('is_active', true)->first();
    }

    public function getHasMonthlyAttribute(): bool
    {
        return !is_null($this->price_monthly);
    }
    
    public function getHasYearlyAttribute(): bool
    {
        return !is_null($this->price_yearly);
    }

    public function getFinalPriceMonthlyAttribute()
    {
        if (!$this->price_monthly) return 0;
        return $this->price_monthly - ($this->price_monthly * ($this->discount_monthly_percent / 100));
    }

    public function getFinalPriceYearlyAttribute()
    {
        if (!$this->price_yearly) return 0;
        return $this->price_yearly - ($this->price_yearly * ($this->discount_yearly_percent / 100));
    }

    public function modules()
    {
        return $this->belongsToMany(Module::class, 'plan_module');
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class, 'plan_id');
    }
}