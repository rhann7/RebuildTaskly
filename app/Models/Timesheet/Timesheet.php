<?php

namespace App\Models\Timesheet;

use App\Models\TaskManagement\Tasks\Task;
use App\Models\TaskManagement\SubTasks\SubTask;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany; // Tambahkan ini

class Timesheet extends Model
{
    protected $fillable = [
        'timesheet_id', // Pastikan ini ada jika pakai sistem header-detail
        'user_id',
        'workspace_id',
        'task_id',
        'sub_task_id',
        'note',
        'start_at',
        'end_at',
        'total_hours'
    ];

    protected $casts = [
        'start_at' => 'date', // Sesuaikan dengan migration
        'end_date' => 'date',
    ];

    // INI PENTING: Relasi ke baris-baris detailnya
    public function entries(): HasMany
    {
        return $this->hasMany(TimesheetEntry::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function calculateTotals()
    {
        $this->total_hours = $this->entries()->sum('hours');
        $this->save();
    }
    public function approvals()
    {
        return $this->hasMany(TimesheetApproval::class);
    }
}
