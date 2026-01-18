<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArticleFeedback extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'article_id',
        'is_helpful',
        'comment',
        'feedback_by',
        'feedback_at',
    ];

    protected $casts = [
        'is_helpful' => 'boolean',
        'feedback_at' => 'datetime',
    ];

    /**
     * Get the article that owns the feedback.
     */
    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }
}
