<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ArticleCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'created_by',
        'updated_by',
    ];

    /**
     * Get all articles for this category.
     */
    public function articles(): HasMany
    {
        return $this->hasMany(Article::class, 'category_article_id');
    }

    /**
     * Store a new article category.
     */
    public static function store(array $data): self
    {
        return self::create([
            'name' => $data['name'],
            'created_by' => $data['created_by'] ?? 'Bot',
        ]);
    }

    /**
     * Update the article category.
     */
    public function updateCategory(array $data): bool
    {
        return $this->update([
            'name' => $data['name'] ?? $this->name,
            'updated_by' => $data['updated_by'] ?? 'Bot',
        ]);
    }

    /**
     * Delete the article category.
     * Returns false if category still has articles.
     */
    public function destroyArticle(): bool
    {
        // Check if category has articles
        if ($this->articles()->count() > 0) {
            return false;
        }

        return $this->delete();
    }
}
