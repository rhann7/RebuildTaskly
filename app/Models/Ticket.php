<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
class Ticket extends Model
{
    protected $fillable = [
        'code',
        'company_id',
        'title',
        'description',
        'type',
        'priority',
        'status',
        'created_by',
        'assigned_to',
        'resolved_at',
        'closed_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
        'closed_at'   => 'datetime',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function comments()
    {
        return $this->hasMany(TicketComment::class);
    }

    public function messages()
    {
        return $this->hasMany(TicketMessage::class);
    }

    public function histories()
    {
        return $this->hasMany(TicketStatusHistory::class);
    }

    public function proposal()
    {
        return $this->hasOne(TicketProposal::class);
    }
}
