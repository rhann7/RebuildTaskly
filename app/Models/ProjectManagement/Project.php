<?php

namespace App\Models\ProjectManagement;

use App\Models\TaskManagement\Task;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = ['workspace_id', 'name', 'slug', 'description', 'status', 'priority', 'due_date'];

    protected $casts = [
    'due_date' => 'date',
    ];

    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function members()
    {
        // Ini relasi many-to-many ke User lewat tabel pivot project_user
        return $this->belongsToMany(\App\Models\User::class, 'project_user')
                    ->withPivot('project_role')
                    ->withTimestamps();
    }
}
