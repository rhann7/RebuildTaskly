<?php

namespace App\Models\TaskManagement;

use App\Models\ProjectManagement\Project;
use App\Models\Timesheet\Timesheet;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class SubTask extends Model
{
    protected $fillable = ['task_id', 'title', 'is_completed', 'completed_by'];

    // TAMBAHKAN INI AGAR REACT MEMBACANYA SEBAGAI BOOLEAN (TRUE/FALSE)
    protected $casts = [
        'is_completed' => 'boolean',
    ];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function timesheets()
    {
        return $this->hasMany(Timesheet::class);
    }

    public function completer()
    {
        return $this->belongsTo(User::class, 'completed_by');
    }
}
