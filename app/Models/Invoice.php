<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'number',
        'company_id',
        'plan_id',
        'plan_name',
        'amount',
        'plan_duration',
        'status',
        'snap_token',
        'payment_reference',
        'payment_method',
        'due_date',
        'paid_at',
    ];

    protected $casts = [
        'due_date' => 'datetime',
        'paid_at'  => 'datetime',
        'amount'   => 'float',
    ];

    protected static function booted()
    {
        static::creating(function ($invoice) {
            if (!$invoice->number) $invoice->number = 'INV/' . now()->format('Ymd') . '/' . strtoupper(Str::random(5));
        });
    }

    public function scopeUnpaid($query)
    {
        return $query->where('status', 'unpaid');
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', 'unpaid')->where('due_date', '<', now());
    }

    public function scopeByNumber($query, $number)
    {
        return $query->where('number', $number);
    }

    public function scopeByToken($query, $token)
    {
        return $query->where('snap_token', $token);
    }

    public function scopeForCompany($query, $companyId) {
        return $query->where('company_id', $companyId);
    }

    protected function formattedAmount(): Attribute {
        return Attribute::make(
            get: fn () => 'Rp ' . number_format($this->amount, 0, ',', '.')
        );
    }

    protected function isPayable(): Attribute {
        return Attribute::make(
            get: fn () => $this->status === 'unpaid' && $this->due_date->isFuture()
        );
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function subscription()
    {
        return $this->hasOne(Subscription::class);
    }

    public function proposals()
    {
        return $this->hasMany(TicketProposal::class);
    }
}
