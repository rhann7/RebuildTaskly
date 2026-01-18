<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArticleComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'article_id',
        'comment',
        'comment_by',
    ];

    /**
     * Get the article that owns the comment.
     */
    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }
}
