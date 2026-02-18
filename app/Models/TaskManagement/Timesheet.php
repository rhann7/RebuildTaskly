<?php

namespace App\Models\TaskManagement; 
use App\Models\TaskManagement\SubTask;
use App\Models\TaskManagement\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Timesheet extends Model
{
    protected $fillable = [
        'user_id',
        'workspace_id',
        'task_id',
        'sub_task_id',
        'note',
        'start_at',
        'end_at',
        'duration_minutes'
    ];

    // Relasi ke Task Utama
    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    // Relasi ke Sub-Task (Objective detail)
    public function subTask()
    {
        return $this->belongsTo(SubTask::class);
    }

    // Relasi ke User (Operative yang bekerja)
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}