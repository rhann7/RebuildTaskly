<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArticleRating extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'article_id',
        'rate',
        'total_rate',
        'rate_badge',
        'rated_by',
        'rated_at',
    ];

    protected $casts = [
        'rate' => 'float',
        'total_rate' => 'integer',
        'rated_at' => 'datetime',
    ];

    /**
     * Get the article that owns the rating.
     */
    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }
}
