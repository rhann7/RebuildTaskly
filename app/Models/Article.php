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

    public static function indexQuery($filters = [])
    {
        $query = self::join('article_categories', 'articles.category_article_id', '=', 'article_categories.id')
            ->select(
                'articles.id',
                'articles.name',
                'articles.tag_code',
                'articles.status',
                'articles.view_count',
                'articles.device_type',
                'article_categories.name as category',
                'articles.created_at'
            )
            ->when(isset($filters['search']), function ($q) use ($filters) {
                $q->where('articles.name', 'like', '%' . $filters['search'] . '%')
                    ->orWhere('articles.tag_code', 'like', '%' . $filters['search'] . '%');
            })
            ->when(isset($filters['status']), function ($q) use ($filters) {
                $q->where('articles.status', $filters['status']);
            })
            ->when(isset($filters['category_id']), function ($q) use ($filters) {
                $q->where('articles.category_article_id', $filters['category_id']);
            })
            ->orderBy('articles.view_count', 'desc')
            ->orderBy('articles.id', 'desc');

        return $query;
    }

    public static function store(array $data): self
    {
        return self::create([
            'name' => $data['name'],
            'tag_code' => $data['tag_code'],
            'status' => $data['status'],
            'view_count' => $data['view_count'],
            'device_type' => $data['device_type'],
            'category_article_id' => $data['category_article_id'],
            'created_by' =>  $data['created_by'],
        ]);
    }

    public static function updateArticle(array $data, int $id): self {
        $article = self::findOrFail($id);
        $article->update([
            'name' => $data['name'],
            'category_article_id' => $data['category_article_id'],
        ]);

        return $article;
    }

    public function updateStatusArticle(int $id, array $data): self {
        $article = self::findOrFail($id);
        $article->update(['status' => $data['status']]);

        return $article;
    }

    public function updateViewCountArticle(int $id, array $data): self {
        $article = self::findOrFail($id);
        $article->update(['view_count' => $data['view_count']]);

        return $article;
    }

    public static function destroyArticle(int $id): self {
        $article = self::findOrFail($id);
        $article->detail()->delete();
        $article->comments()->delete();
        $article->delete();

        return $article;
    }
}
