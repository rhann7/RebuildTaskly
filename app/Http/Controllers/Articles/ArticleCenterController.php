<?php

namespace App\Http\Controllers\Articles;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ArticleCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ArticleCenterController extends Controller
{
    public function index(Request $request)
    {
        $query = Article::select('articles.*')
            ->with([
                'detail.images',
                'category',
            ])
            ->join('article_categories', 'articles.category_article_id', '=', 'article_categories.id')
            ->leftJoin('article_key_summaries', 'articles.id', '=', 'article_key_summaries.article_id')
            ->leftJoin('article_key_searches', 'article_key_summaries.article_keyword_id', '=', 'article_key_searches.article_keyword_id')
            ->leftJoin('article_keywords', 'article_key_summaries.article_keyword_id', '=', 'article_keywords.id')
            ->where('articles.status', 'published')
            ->groupBy('articles.id', 'article_categories.id', 'article_categories.name');

        // Search functionality - search in article name, tag, and category name
        $hasSearch = $request->has('search') && !empty($request->search);
        if ($hasSearch) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('articles.name', 'like', "%{$search}%")
                    ->orWhere('articles.tag_code', 'like', "%{$search}%")
                    ->orWhere('article_categories.name', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->has('category') && !empty($request->category)) {
            $query->where('articles.category_article_id', $request->category);
        }

        $articles = $query
            ->orderByRaw('COALESCE(MAX(article_keywords.rate_keyword), 0) DESC')
            ->orderByRaw('COALESCE(SUM(article_key_summaries.total), 0) DESC')
            ->orderByRaw('COALESCE(MAX(article_key_summaries.accurate_key), 0) DESC')
            ->orderByRaw('COUNT(article_key_searches.id) DESC')
            ->orderBy('articles.view_count', 'DESC')
            ->orderBy('articles.created_at', 'DESC')
            ->paginate(12);

        // Get popular categories (top 4)
        $popularCategories = ArticleCategory::select('article_categories.*')
            ->join('articles', 'articles.category_article_id', '=', 'article_categories.id')
            ->where('articles.status', 'published')
            ->groupBy('article_categories.id')
            ->orderByRaw('COUNT(articles.id) DESC')
            ->limit(4)
            ->get();

        $allCategories = ArticleCategory::all();

        return Inertia::render('article/article-center', [
            'articles' => $articles,
            'popularCategories' => $popularCategories,
            'allCategories' => $allCategories,
            'filters' => [
                'search' => $request->search,
                'category' => $request->category,
            ],
            'hasSearch' => $hasSearch,
        ]);
    }

    public function show(Article $article)
    {
        // Increment view count
        $article->increment('view_count');

        $article->load([
            'detail.images',
            'category',
            'keySummaries.keyword',
        ]);

        // Get related articles from same category
        $relatedArticles = Article::where('category_article_id', $article->category_article_id)
            ->where('id', '!=', $article->id)
            ->where('status', 'published')
            ->with(['category', 'detail.images'])
            ->limit(4)
            ->get();

        return Inertia::render('article/article-center-detail', [
            'article' => $article,
            'relatedArticles' => $relatedArticles,
        ]);
    }
}
