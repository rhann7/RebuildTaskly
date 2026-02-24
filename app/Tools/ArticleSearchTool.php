<?php

namespace App\Tools;

use App\Models\Article;
use App\Models\ArticleCategory;
use Vizra\VizraADK\Contracts\ToolInterface;
use Vizra\VizraADK\Memory\AgentMemory;
use Vizra\VizraADK\System\AgentContext;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ArticleSearchTool implements ToolInterface
{
    /**
     * Get the tool's definition for the LLM.
     * This structure should be JSON schema compatible.
     */
    public function definition(): array
    {
        return [
            'name' => 'search_articles',
            'description' => 'Mencari artikel berdasarkan kata kunci, kategori, atau tag. Tool ini membantu menemukan artikel yang relevan untuk menjawab pertanyaan pengguna dari knowledge base.',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'query' => [
                        'type' => 'string',
                        'description' => 'Kata kunci pencarian untuk mencari artikel berdasarkan judul atau konten (optional)',
                    ],
                    'category' => [
                        'type' => 'string',
                        'description' => 'Nama kategori artikel untuk memfilter hasil pencarian (optional)',
                    ],
                    'tag' => [
                        'type' => 'string',
                        'description' => 'Tag code artikel untuk pencarian spesifik (optional)',
                    ],
                    'limit' => [
                        'type' => 'integer',
                        'description' => 'Jumlah maksimal artikel yang dikembalikan (default: 5, max: 10)',
                        'default' => 5,
                    ],
                ],
                'required' => [],
            ],
        ];
    }

    /**
     * Execute the tool's logic.
     *
     * @param array $arguments Arguments provided by the LLM
     * @param AgentContext $context The current agent context
     * @param AgentMemory $memory Agent memory for storing facts and learning
     * @return string JSON string representation of the tool's result
     */
    public function execute(array $arguments, AgentContext $context, AgentMemory $memory): string
    {
        try {
            // Get parameters dengan default values
            $query = $arguments['query'] ?? null;
            $category = $arguments['category'] ?? null;
            $tag = $arguments['tag'] ?? null;
            $limit = min($arguments['limit'] ?? 5, 10); // Max 10 articles

            // Build query dengan left join untuk menghindari missing relations
            $articlesQuery = Article::query()
                ->leftJoin('article_categories', 'articles.category_article_id', '=', 'article_categories.id')
                ->leftJoin('article_details', 'articles.id', '=', 'article_details.article_id')
                ->select(
                    'articles.id',
                    'articles.name',
                    'articles.tag_code',
                    'articles.status',
                    'articles.view_count',
                    'articles.created_at',
                    'article_categories.name as category_name',
                    'article_details.description'
                );

            // Filter hanya artikel published (jika ada)
            if (DB::getSchemaBuilder()->hasColumn('articles', 'status')) {
                $articlesQuery->where('articles.status', 'published');
            }

            // Filter by search query
            if ($query) {
                $articlesQuery->where(function ($q) use ($query) {
                    $q->where('articles.name', 'ilike', '%' . $query . '%')
                        ->orWhere('articles.tag_code', 'ilike', '%' . $query . '%')
                        ->orWhere('article_details.description', 'ilike', '%' . $query . '%');
                });
            }

            // Filter by category
            if ($category) {
                $articlesQuery->where('article_categories.name', 'ilike', '%' . $category . '%');
            }

            // Filter by tag
            if ($tag) {
                $articlesQuery->where('articles.tag_code', 'ilike', '%' . $tag . '%');
            }

            // Get results
            $articles = $articlesQuery
                ->orderBy('articles.view_count', 'desc')
                ->orderBy('articles.created_at', 'desc')
                ->limit($limit)
                ->get();

            // If no articles found
            if ($articles->isEmpty()) {
                // Check if there are any articles at all
                $totalArticles = Article::count();

                if ($totalArticles === 0) {
                    return json_encode([
                        'status' => 'success',
                        'found' => 0,
                        'message' => 'Belum ada artikel di knowledge base. Silakan tambahkan artikel terlebih dahulu.',
                        'articles' => [],
                    ]);
                }

                return json_encode([
                    'status' => 'success',
                    'found' => 0,
                    'message' => 'Tidak ada artikel yang ditemukan dengan kriteria pencarian tersebut. Coba gunakan kata kunci lain.',
                    'articles' => [],
                ]);
            }

            // Format articles data
            $formattedArticles = [];
            foreach ($articles as $article) {
                $formattedArticles[] = [
                    'id' => $article->id,
                    'title' => $article->name ?? 'Untitled',
                    'tag_code' => $article->tag_code ?? '',
                    'category' => $article->category_name ?? 'Uncategorized',
                    'description' => $article->description ?? 'No description available',
                    'view_count' => $article->view_count ?? 0,
                    'created_at' => $article->created_at ? $article->created_at->format('d M Y') : 'Unknown',
                ];
            }

            // Store search activity to memory (optional, might cause issues)
            try {
                $searchTerm = $query ?? $category ?? $tag ?? 'all';
                $memory->addFact("User mencari artikel: {$searchTerm}", 0.8);
                $memory->addLearning("Pencarian artikel dengan query: {$searchTerm} menemukan " . count($formattedArticles) . " hasil");
            } catch (\Exception $memoryError) {
                // Ignore memory errors
            }

            return json_encode([
                'status' => 'success',
                'found' => count($formattedArticles),
                'message' => "Ditemukan " . count($formattedArticles) . " artikel yang relevan.",
                'articles' => $formattedArticles,
            ], JSON_UNESCAPED_UNICODE);
        } catch (\Exception $e) {
            \Log::error('ArticleSearchTool Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'arguments' => $arguments,
            ]);

            return json_encode([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat mencari artikel. Silakan coba lagi atau hubungi administrator.',
                'error_detail' => config('app.debug') ? $e->getMessage() : null,
                'articles' => [],
            ], JSON_UNESCAPED_UNICODE);
        }
    }
}
