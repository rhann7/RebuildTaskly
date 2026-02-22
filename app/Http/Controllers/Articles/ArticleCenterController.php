<?php

namespace App\Http\Controllers\Articles;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ArticleCategory;
use App\Models\ArticleKeyword;
use App\Models\ArticleKeySearch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Jenssegers\Agent\Agent;

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

            // Track this search for analytics
            $this->trackSearch($search, $request);

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

    /**
     * Track search keyword and device for analytics
     */
    private function trackSearch(string $searchQuery, Request $request): void
    {
        try {
            // Clean and normalize search query
            $keyword = trim(strtolower($searchQuery));

            if (empty($keyword) || strlen($keyword) < 2) {
                return; // Skip very short searches
            }

            // Detect device type using Agent library
            $agent = new Agent();
            $deviceType = $this->getDeviceType($agent);

            // Find or create keyword
            $articleKeyword = ArticleKeyword::firstOrCreate(
                ['name' => $keyword],
                ['rate_keyword' => 1.0] // Initial rate
            );

            // Update keyword rate based on search frequency
            // Rate increases slightly with each search (capped at 10.0)
            if ($articleKeyword->wasRecentlyCreated) {
                $articleKeyword->rate_keyword = 1.0;
            } else {
                // Increment rate by 0.1 for each search, max 10.0
                $articleKeyword->rate_keyword = min(10.0, $articleKeyword->rate_keyword + 0.1);
            }
            $articleKeyword->save();

            // Get authenticated user ID (or null for guests)
            $userId = Auth::id();

            // Record the search
            ArticleKeySearch::create([
                'article_keyword_id' => $articleKeyword->id,
                'users_id' => $userId,
                'device_type' => $deviceType,
                'search_at' => now(),
            ]);

            \Log::info('Search tracked', [
                'keyword' => $keyword,
                'device' => $deviceType,
                'user_id' => $userId,
                'rate' => $articleKeyword->rate_keyword,
            ]);
        } catch (\Exception $e) {
            // Don't break user experience if tracking fails
            \Log::error('Failed to track search', [
                'keyword' => $searchQuery,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Get detailed device type from user agent
     */
    private function getDeviceType(Agent $agent): string
    {
        // Get device name (iPhone, Samsung, etc)
        $device = $agent->device();

        // Get platform (Windows, iOS, Android, macOS, etc)
        $platform = $agent->platform();

        // Get browser
        $browser = $agent->browser();

        // Build descriptive device type
        if ($agent->isDesktop()) {
            $version = $platform ? " {$platform}" : '';
            return "Desktop{$version}";
        } elseif ($agent->isPhone()) {
            if ($agent->isAndroidOS()) {
                return $device ? "Android {$device}" : 'Android Mobile';
            } elseif ($agent->is('iPhone')) {
                return 'iPhone';
            }
            return $device ?: 'Mobile Phone';
        } elseif ($agent->isTablet()) {
            if ($agent->is('iPad')) {
                return 'iPad';
            } elseif ($agent->isAndroidOS()) {
                return $device ? "Android {$device} Tablet" : 'Android Tablet';
            }
            return $device ?: 'Tablet';
        } elseif ($agent->isRobot()) {
            return "Bot ({$agent->robot()})";
        }

        // Fallback
        return $platform ?: 'Unknown Device';
    }
}
