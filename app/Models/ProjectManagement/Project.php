<?php

namespace App\Models\ProjectManagement;

use App\Models\Workspace;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = ['workspace_id', 'name', 'slug', 'description', 'status'];

    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }
}
