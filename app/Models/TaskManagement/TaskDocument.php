<?php
namespace App\Models\TaskManagement;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use App\Models\TaskManagement\Task;
use App\Models\User;

class TaskDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_id',
        'user_id',
        'file_name',
        'file_path',
        'file_type',
        'file_size',
    ];

    // Otomatis kasih URL lengkap buat frontend
    protected $appends = ['file_url'];

    /**
     * Relasi ke Task
     */
    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    /**
     * Relasi ke User (Uploader)
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Accessor buat dapetin URL file yang bisa diakses publik
     */
    public function getFileUrlAttribute()
    {
        return asset(Storage::url($this->file_path));
    }
}