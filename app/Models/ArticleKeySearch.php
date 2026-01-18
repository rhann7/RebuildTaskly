<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArticleKeySearch extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'article_keyword_id',
        'users_id',
        'device_type',
        'search_at',
    ];

    protected $casts = [
        'users_id' => 'integer',
        'search_at' => 'datetime',
    ];

    /**
     * Get the keyword that owns the key search.
     */
    public function keyword(): BelongsTo
    {
        return $this->belongsTo(ArticleKeyword::class, 'article_keyword_id');
    }

    /**
     * Get the user that made the search.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'users_id');
    }
}
