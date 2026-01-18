<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ArticleKeyword extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'rate_keyword',
    ];

    protected $casts = [
        'rate_keyword' => 'float',
    ];

    /**
     * Get all key summaries for the keyword.
     */
    public function keySummaries(): HasMany
    {
        return $this->hasMany(ArticleKeySummary::class);
    }

    /**
     * Get all key searches for the keyword.
     */
    public function keySearches(): HasMany
    {
        return $this->hasMany(ArticleKeySearch::class);
    }
}
