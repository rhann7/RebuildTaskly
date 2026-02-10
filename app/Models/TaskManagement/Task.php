<?php

namespace App\Models\TaskManagement;

use App\Models\ProjectManagement\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = ['project_id', 'title', 'slug', 'description', 'status', 'priority', 'due_date'];

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
}
