<?php

namespace App\Models\TaskManagement;

use App\Models\ProjectManagement\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class subTask extends Model
{
    protected $fillable = ['project_id', 'title', 'slug', 'description', 'status', 'priority', 'due_date'];
    public function task()
    {
        return $this->belongsTo(Task::class);
    }
    public function project()
    {
        return $this->belongsTo(Project::class);
    }
    public function completer()
    {
        return $this->belongsTo(User::class, 'completed_by');
    }
}
