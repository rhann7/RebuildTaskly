<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArticleKeySummary extends Model
{
    use HasFactory;

    protected $fillable = [
        'article_id',
        'article_keyword_id',
        'total',
        'accurate_key',
    ];

    protected $casts = [
        'total' => 'integer',
        'accurate_key' => 'float',
    ];

    /**
     * Get the article that owns the key summary.
     */
    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }

    /**
     * Get the keyword that owns the key summary.
     */
    public function keyword(): BelongsTo
    {
        return $this->belongsTo(ArticleKeyword::class, 'article_keyword_id');
    }
}
