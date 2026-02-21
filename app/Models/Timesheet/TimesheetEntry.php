<?php

namespace App\Models\Timesheet;

use App\Models\TaskManagement\SubTask;
use App\Models\TaskManagement\Task;
use App\Models\User;

use Illuminate\Database\Eloquent\Model;

class TimesheetEntry extends Model
{
    protected $fillable = [
        'timesheet_id',
        'user_id',
        'project_id',
        'task_id',
        'sub_task_id',
        'date',
        'start_time',
        'end_time',
        'hours',
        'description',
        'is_billable'
    ];

    // Relasi balik ke Header
    public function timesheet()
    {
        return $this->belongsTo(Timesheet::class);
    }

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function subTask()
    {
        return $this->belongsTo(SubTask::class);
    }
}
