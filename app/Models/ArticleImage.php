<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArticleImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'article_detail_id',
        'url_image',
        'type_image',
        'size_image',
    ];

    protected $casts = [
        'size_image' => 'integer',
    ];

    /**
     * Get the article detail that owns the image.
     */
    public function articleDetail(): BelongsTo
    {
        return $this->belongsTo(ArticleDetail::class);
    }
}
