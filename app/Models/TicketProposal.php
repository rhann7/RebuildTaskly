<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TicketProposal extends Model
{
    protected $fillable = [
        'ticket_id',
        'invoice_id',       // diisi saat proposal ditagih di invoice renewal
        'estimated_price',
        'estimated_days',
        'module_id',
        'status',           // pending | approved | billed | rejected
        'approved_at',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
    ];

    // -------------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------------

    // Proposal yang sudah diapprove tapi belum dimasukkan ke invoice manapun
    public function scopeUnbilled($query)
    {
        return $query->where('status', 'approved')->whereNull('invoice_id');
    }

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function invoiceAddOn()
    {
        return $this->hasOne(InvoiceAddOn::class);
    }
}
