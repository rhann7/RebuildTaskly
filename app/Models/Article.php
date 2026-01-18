<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Article extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'tag_code',
        'status',
        'view_count',
        'device_type',
        'category_article_id',
        'created_by',
    ];

    protected $casts = [
        'view_count' => 'integer',
    ];

    /**
     * Get the category that owns the article.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ArticleCategory::class, 'category_article_id');
    }

    /**
     * Get the article detail.
     */
    public function detail(): HasOne
    {
        return $this->hasOne(ArticleDetail::class);
    }

    /**
     * Get all ratings for the article.
     */
    public function ratings(): HasMany
    {
        return $this->hasMany(ArticleRating::class);
    }

    /**
     * Get all feedbacks for the article.
     */
    public function feedbacks(): HasMany
    {
        return $this->hasMany(ArticleFeedback::class);
    }

    /**
     * Get all comments for the article.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(ArticleComment::class);
    }

    /**
     * Get all key summaries for the article.
     */
    public function keySummaries(): HasMany
    {
        return $this->hasMany(ArticleKeySummary::class);
    }
}
