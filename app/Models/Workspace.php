<?php

namespace App\Models;

use App\Models\ProjectManagement\Project;
use App\Models\TaskManagement\Task;
use Illuminate\Database\Eloquent\Model;

class Workspace extends Model
{
    protected $fillable = ['company_id', 'name', 'slug', 'description', 'status', 'manager_id'];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function projects()
    {
        return $this->hasMany(Project::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function getRouteKeyName()
    {
    return 'slug';
    }

    public function manager()
    {
    return $this->belongsTo(User::class, 'manager_id');
    }

    public function members(){
    return $this->belongsToMany(User::class, 'workspace_user')
                ->withPivot('workspace_role')
                ->withTimestamps();
    }
}