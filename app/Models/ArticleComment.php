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

    /**
     * Store a new comment.
     */
    public static function store(array $data): self
    {
        return self::create([
            'article_id' => $data['article_id'],
            'comment' => $data['comment'],
            'comment_by' => $data['comment_by'] ?? auth()->user()->name,
        ]);
    }

    /**
     * Update the comment.
     */
    public function updateComment(array $data): bool
    {
        return $this->update([
            'comment' => $data['comment'] ?? $this->comment,
        ]);
    }

    /**
     * Delete the comment.
     */
    public function destroyComment(): bool
    {
        return $this->delete();
    }
}
