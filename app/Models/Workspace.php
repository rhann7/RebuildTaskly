<?php

namespace App\Models;

use App\Models\ProjectManagement\Project;
use Illuminate\Database\Eloquent\Model;

class Workspace extends Model
{
    protected $fillable = ['company_id', 'name', 'slug', 'description', 'status'];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function projects()
    {
        return $this->hasMany(Project::class);
    }
}