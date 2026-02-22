<?php

namespace App\Http\Controllers\Articles;

use App\Http\Controllers\Controller;
use App\Models\ArticleKeySearch;
use App\Models\ArticleKeyword;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ArticleAnalyticController extends Controller
{
    /**
     * Display article analytics page
     */
    public function index()
    {
        // Get top keywords with highest rate
        $topKeywords = ArticleKeyword::orderBy('rate_keyword', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($keyword) {
                return [
                    'id' => $keyword->id,
                    'name' => $keyword->name,
                    'rate' => $keyword->rate_keyword,
                    'search_count' => $keyword->keySearches()->count(),
                ];
            });

        // Get device with most searches (potential issues indicator)
        // Focus on devices searching for high-rate keywords (rate > 5.0 = 50% of max 10.0)
        $deviceIssues = ArticleKeySearch::select('device_type')
            ->selectRaw('COUNT(*) as search_count')
            ->selectRaw('COUNT(DISTINCT article_keyword_id) as unique_keywords')
            ->join('article_keywords', 'article_key_searches.article_keyword_id', '=', 'article_keywords.id')
            ->where('article_keywords.rate_keyword', '>', 5.0) // High activity keywords only
            ->groupBy('device_type')
            ->orderBy('search_count', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($device) {
                // Get all high-rate keywords for this device (rate > 5.0)
                $highRateKeywords = ArticleKeySearch::where('device_type', $device->device_type)
                    ->join('article_keywords', 'article_key_searches.article_keyword_id', '=', 'article_keywords.id')
                    ->where('article_keywords.rate_keyword', '>', 5.0)
                    ->select('article_keywords.id', 'article_keywords.name', 'article_keywords.rate_keyword')
                    ->selectRaw('COUNT(*) as search_count')
                    ->groupBy('article_keywords.id', 'article_keywords.name', 'article_keywords.rate_keyword')
                    ->orderBy('search_count', 'desc')
                    ->limit(3)
                    ->get();

                // Get most searched keyword for this device
                $topKeyword = $highRateKeywords->first();

                // Find similar keywords (containing same words)
                $similarKeywords = [];
                if ($topKeyword) {
                    $topWords = explode(' ', $topKeyword->name);
                    $similarKeywords = ArticleKeySearch::where('device_type', $device->device_type)
                        ->join('article_keywords', 'article_key_searches.article_keyword_id', '=', 'article_keywords.id')
                        ->where('article_keywords.id', '!=', $topKeyword->id)
                        ->where('article_keywords.rate_keyword', '>', 5.0)
                        ->where(function ($query) use ($topWords) {
                            foreach ($topWords as $word) {
                                if (strlen($word) > 3) { // Only meaningful words
                                    $query->orWhere('article_keywords.name', 'like', "%{$word}%");
                                }
                            }
                        })
                        ->select('article_keywords.name')
                        ->distinct()
                        ->limit(3)
                        ->pluck('name')
                        ->toArray();
                }

                return [
                    'device_type' => $device->device_type,
                    'search_count' => $device->search_count,
                    'unique_keywords' => $device->unique_keywords,
                    'top_keyword' => $topKeyword ? $topKeyword->name : null,
                    'top_keyword_rate' => $topKeyword ? $topKeyword->rate_keyword : 0,
                    'top_keyword_count' => $topKeyword ? $topKeyword->search_count : 0,
                    'high_rate_keywords' => $highRateKeywords->pluck('name')->toArray(),
                    'similar_keywords' => $similarKeywords,
                    'is_critical' => $device->search_count > 20 && $topKeyword && $topKeyword->rate_keyword > 7.0,
                ];
            });

        // Get keyword search data for datatable
        $keywordSearches = ArticleKeySearch::with(['keyword', 'user'])
            ->select('article_key_searches.*')
            ->join('article_keywords', 'article_key_searches.article_keyword_id', '=', 'article_keywords.id')
            ->orderBy('article_key_searches.search_at', 'desc')
            ->paginate(10)
            ->through(function ($search) {
                return [
                    'id' => $search->id,
                    'keyword' => $search->keyword?->name ?? 'Unknown',
                    'keyword_rate' => $search->keyword?->rate_keyword ?? 0,
                    'user_name' => $search->user?->name ?? 'Guest',
                    'device_type' => $search->device_type,
                    'search_at' => $search->search_at?->format('Y-m-d H:i:s'),
                    'search_at_human' => $search->search_at?->diffForHumans(),
                ];
            });

        // Summary stats
        $stats = [
            'total_searches' => ArticleKeySearch::count(),
            'total_keywords' => ArticleKeyword::count(),
            'total_unique_users' => ArticleKeySearch::distinct('users_id')->count('users_id'),
            'avg_keyword_rate' => ArticleKeyword::avg('rate_keyword') ?? 0,
        ];

        return Inertia::render('article/analytic', [
            'topKeywords' => $topKeywords,
            'deviceIssues' => $deviceIssues,
            'keywordSearches' => $keywordSearches,
            'stats' => $stats,
        ]);
    }

    /**
     * Export analytics data
     */
    public function export(Request $request)
    {
        // Get all keyword searches with related data
        $searches = ArticleKeySearch::with(['keyword', 'user'])
            ->join('article_keywords', 'article_key_searches.article_keyword_id', '=', 'article_keywords.id')
            ->orderBy('article_key_searches.search_at', 'desc')
            ->get()
            ->map(function ($search) {
                return [
                    'Keyword' => $search->keyword?->name ?? 'Unknown',
                    'Keyword Rate' => $search->keyword?->rate_keyword ?? 0,
                    'User' => $search->user?->name ?? 'Guest',
                    'Device Type' => $search->device_type,
                    'Search Date' => $search->search_at?->format('Y-m-d H:i:s'),
                ];
            });

        $filename = 'article-analytics-' . now()->format('Y-m-d-His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($searches) {
            $file = fopen('php://output', 'w');

            // Add BOM for Excel UTF-8 support
            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));

            // Headers
            fputcsv($file, ['Keyword', 'Keyword Rate', 'User', 'Device Type', 'Search Date']);

            // Data
            foreach ($searches as $search) {
                fputcsv($file, $search);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
