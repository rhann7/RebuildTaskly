<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $fillable = [
        'invoice_id',
        'company_id',
        'plan_id',
        'starts_at',
        'ends_at',
        'billing_cycle',
        'status',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at'   => 'datetime',
    ];

    public function scopeActive($query)
    {
        return $query->where('status', 'active')
            ->where('ends_at', '>', now());
    }

    public function scopeExpiringSoon($query, $days = 3)
    {
        return $query->where('status', 'active')    
            ->where('ends_at', '>', now())
            ->where('ends_at', '<=', now()
            ->addDays($days));
    }

    public function getIsExpiringSoonAttribute(): bool
    {
        return $this->status === 'active' 
            && $this->ends_at->isFuture() 
            && $this->ends_at->diffInDays(now()) <= 3;
    }

    public function getIsFreeAttribute(): bool
    {
        return $this->plan?->is_free ?? false;
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }
}