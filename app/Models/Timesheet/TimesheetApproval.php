<?php

namespace App\Models\Timesheet;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class TimesheetApproval extends Model
{
    protected $fillable = ['timesheet_id', 'approver_id', 'status', 'comments'];

    public function timesheet()
    {
        return $this->belongsTo(Timesheet::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approver_id');
    }
}