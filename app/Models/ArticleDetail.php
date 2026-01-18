<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ArticleDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'article_id',
        'description',
        'created_by',
        'updated_by',
    ];

    /**
     * Get the article that owns the detail.
     */
    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }

    /**
     * Get all images for the article detail.
     */
    public function images(): HasMany
    {
        return $this->hasMany(ArticleImage::class);
    }
}
