<?php

namespace App\Models\TaskManagement;

use App\Models\ProjectManagement\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class SubTask extends Model
{
    protected $fillable = ['task_id', 'title', 'is_completed', 'completed_by'];

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
        // Karena kolomnya user_id, kita kasih tau Laravel secara manual
        return $this->belongsTo(User::class, 'user_id');
    }
}
