<?php

namespace App\Models\TaskManagement;

use App\Models\ProjectManagement\Project;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = ['project_id', 'title', 'slug', 'description', 'status'];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
