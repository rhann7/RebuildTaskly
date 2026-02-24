<?php

namespace App\Models\TaskManagement;

use App\Models\ProjectManagement\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use App\Models\TaskManagement\TaskDocument;
use App\Models\Timesheet;
use App\Models\Timesheet\Timesheet as ModelsTimesheet;
use App\Models\Timesheet\TimesheetEntry;

class Task extends Model
{
    protected $fillable = ['project_id', 'user_id', 'title', 'slug', 'description', 'status', 'priority', 'due_date'];

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
        return $this->hasMany(ModelsTimesheet::class);
    }
    public function users()
    {
        // Ini kalau pake table pivot (task_user)
        return $this->belongsToMany(User::class, 'task_user');
    }
    public function documents()
    {
        // Pake hasMany karena satu task bisa punya banyak dokumen
        return $this->hasMany(TaskDocument::class);
    }
    protected $appends = ['manual_progress', 'total_objectives']; // Maksa data ini selalu ikut

    public function getManualProgressAttribute()
    {
        // Hitung langsung di model tiap kali data diakses
        $total = $this->subtasks()->count();
        if ($total === 0) return null;

        $completed = $this->subtasks()->where('is_completed', true)->count();
        return round(($completed / $total) * 100);
    }

    public function getTotalObjectivesAttribute()
    {
        return $this->subtasks()->count();
    }

    public function entries()
    {
        return $this->hasMany(TimesheetEntry::class, 'task_id');
    }
}
