<?php

namespace App\Models\ProjectManagement;

use App\Models\TaskManagement\Task;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Model;
use app\Models\User;

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

    public function users() 
    {
    return $this->belongsToMany(User::class, 'project_user'); // Ganti 'project_user' sesuai nama tabel pivot project lo
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function members()
    {
        // Ini relasi many-to-many ke User lewat tabel pivot project_user
        return $this->belongsToMany(User::class, 'project_user')
                    ->withPivot('project_role')
                    ->withTimestamps();
    }
    

    public function getStatusAttribute($value)
        {
            // 1. Kalau di DB sudah 'completed', biarkan tetap completed
            if (in_array(strtolower($value), ['completed', 'done', 'finished'])) {
                return 'completed';
            }

            // 2. Cek apakah due_date sudah lewat dari hari ini
            // Kita pake $this->due_date yang udah di-cast jadi Carbon
            if ($this->due_date && $this->due_date->isPast() && !$this->due_date->isToday()) {
                return 'overdue';
            }

            // 3. Kalau belum lewat, balikin status aslinya (todo / in progress)
            return $value;
        }
}
