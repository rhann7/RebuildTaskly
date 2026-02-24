<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class InvoiceAddOn extends Model
{
    protected $fillable = [
        'number',
        'company_id',
        'module_id',
        'ticket_proposal_id',
        'description',
        'amount',
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
        'amount'   => 'float', // sama seperti Invoice, bukan decimal:2
    ];

    // -------------------------------------------------------------------------
    // Attributes
    // -------------------------------------------------------------------------

    protected function formattedAmount(): Attribute
    {
        return Attribute::make(
            get: fn() => 'Rp ' . number_format($this->amount, 0, ',', '.')
        );
    }

    protected function isPayable(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->status === 'unpaid' && $this->due_date->isFuture()
        );
    }

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function ticketProposal()
    {
        return $this->belongsTo(TicketProposal::class);
    }
}
