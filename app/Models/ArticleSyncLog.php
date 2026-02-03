<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ArticleSyncLog extends Model
{
    protected $fillable = [
        'pdf_file',
        'pdf_path',
        'total_articles',
        'text_length',
        'vector_memories_count',
        'status',
        'error_message',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public static function lastSuccessful()
    {
        return static::where('status', 'success')
            ->latest()
            ->first();
    }
}
