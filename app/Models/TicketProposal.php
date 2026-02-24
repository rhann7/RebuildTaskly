<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TicketProposal extends Model
{
    protected $fillable = [
        'ticket_id',
        'estimated_price',
        'estimated_days',
        'status',
        'approved_at'
    ];

    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }

    public function invoiceAddOn()
    {
        return $this->hasOne(InvoiceAddOn::class);
    }
}
