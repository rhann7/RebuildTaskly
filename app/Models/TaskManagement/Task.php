<?php

namespace App\Models\TaskManagement;

use App\Models\ProjectManagement\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use App\Models\TaskManagement\TaskDocument;

class Task extends Model
{
    protected $fillable = ['project_id','user_id', 'title', 'slug', 'description', 'status', 'priority', 'due_date'];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function subtasks()
    {
        return $this->hasMany(SubTask::class);
    }
    public function assignee()
    {
        return $this->belongsTo(User::class, 'user_id'); // sesuaikan nama kolomnya
    }
    public function timesheets()
    {
        return $this->hasMany(Timesheet::class);
    }
    public function users()
    {
        // Ini kalau pake table pivot (task_user)
        return $this->belongsToMany(\App\Models\User::class, 'task_user'); 
    }
    public function documents()
    {
        // Pake hasMany karena satu task bisa punya banyak dokumen
        return $this->hasMany(TaskDocument::class);
    }
}
