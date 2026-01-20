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

    /**
     * Store a new article detail.
     */
    public static function store(array $data): self
    {
        return self::create([
            'article_id' => $data['article_id'],
            'description' => $data['description'],
            'created_by' => $data['created_by'],
        ]);
    }

    /**
     * Update the article detail.
     */
    public static function updateDetail(array $data,int $id): self
    {
        $articleDetail = self::findOrFail($id);
        $articleDetail->update([
            'description' => $data['description'],
            'updated_by' => $data['updated_by'],
        ]);

        return $articleDetail;
    }

    /**
     * Delete the article detail and its images.
     */
    public static function destroyDetail(int $id): self
    {
        $articleDetail = self::findOrFail($id);
        $articleDetail->images()->delete();
        
        return $articleDetail;
    }
}
