<?php

namespace App\Http\Controllers\Articles;

use App\Jobs\ArticleJob;
use App\Models\Article;
use App\Models\ArticleCategory;
use App\Models\ArticleDetail;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use iio\libmergepdf\Merger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Jenssegers\Agent\Agent;
use App\Agents\PdfAssistant;
use App\Models\ArticleSyncLog;
use Illuminate\Support\Facades\File;
use Smalot\PdfParser\Parser;

class ArticleController
{
    private $article, $articleDetail, $agent;

    public function __construct(
        Article $Article,
        ArticleDetail $ArticleDetail
    ) {
        $this->article = $Article;
        $this->articleDetail = $ArticleDetail;
        $this->agent = new PdfAssistant();
    }

    public function index(Request $request)
    {
        $filters = [
            'search' => $request->search,
            'status' => $request->status,
            'category_id' => $request->category_id,
        ];

        $articles = $this->article::indexQuery($filters)
            ->paginate(10)
            ->withQueryString();

        $categories = ArticleCategory::select('id', 'name')
            ->orderBy('name', 'asc')
            ->get();

        return inertia('article/index', [
            'articles' => $articles,
            'filters' => $filters,
            'categories' => $categories,
        ]);
    }

    public function create()
    {
        $categories = ArticleCategory::select('id', 'name')
            ->orderBy('name', 'asc')
            ->get();

        return inertia('article/create', [
            'categories' => $categories,
            'tinymce' => config('services.tinymce.api_key')
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'required',
            'category_article_id' => 'required|int',
        ]);

        $device = new Agent();
        $deviceType = '';

        $lastArticle = Article::latest('id')->first();
        $nextNumber = $lastArticle ? $lastArticle->id + 1 : 1;
        $tagCode = 'SARTC-' . Carbon::now()->format('Y') . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);

        if ($device->isMobile()) {
            $deviceType = $device->device() . ' - ' . $device->platform();
        } else {
            $deviceType = $device->browser();
        }

        $article = $this->article::store([
            'name' => $validated['name'],
            'tag_code' => $tagCode,
            'status' => 'draft',
            'view_count' => 0,
            'device_type' => $deviceType,
            'category_article_id' => $validated['category_article_id'],
            'created_by' => Auth::user()->name,
        ]);

        $articleDetail = $this->articleDetail::store([
            'article_id' => $article->id,
            'description' => $validated['description'],
            'created_by' => Auth::user()->name,
        ]);

        ArticleJob::dispatch($articleDetail)->delay(Carbon::now()->addSeconds(0.5));

        return redirect()->back()->with('success', 'Article created successfully.');
    }

    public function updateStatusArticle(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|string'
        ]);

        $articleStatus = $this->article->updateStatusArticle($id, $validated);

        return redirect()->back()->with('success', 'Article updated status successfully.');
    }

    public function show($id)
    {
        $article = Article::with(['detail', 'category'])->findOrFail($id);
        $categories = ArticleCategory::select('id', 'name')
            ->orderBy('name', 'asc')
            ->get();

        return inertia('article/show', [
            'article' => $article,
            'detail' => $article->detail,
            'categories' => $categories,
        ]);
    }

    public function edit($id)
    {
        $article = Article::with('detail')->findOrFail($id);
        $categories = ArticleCategory::select('id', 'name')
            ->orderBy('name', 'asc')
            ->get();

        return inertia('article/edit', [
            'article' => $article,
            'detail' => $article->detail,
            'categories' => $categories,
            'tinymce' => config('services.tinymce.api_key')
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'required',
            'category_article_id' => 'required|int',
        ]);

        $article = $this->article::updateArticle([
            'name' => $validated['name'],
            'category_article_id' => $validated['category_article_id']
        ], $id);

        $articleDetail = $this->articleDetail::updateDetail([
            'description' => $validated['description'],
            'updated_by'  => Auth::user()->name
        ], $article->id);

        ArticleJob::dispatch($articleDetail)->delay(Carbon::now()->addSeconds(0.5));

        return redirect()->back()->with('success', 'Article updated successfully.');
    }

    public function destroy($id)
    {
        $article = $this->article->destroyArticle($id);
        return redirect('article-management/article')->with('success', 'Article deleted successfully.');
    }

    public function readyArticleToSync(Request $request) {
        $since = $request->query('since') ? Carbon::parse($request->query('since')) : Carbon::today();
        $count = Article::where('created_at', '>=', $since)->count();

        return response()->json([
            'count' => $count,
            'since' => $since->toDateTimeString(),
        ]);
    }

    public function syncDocArticle(Request $request)
    {
        try {
            // 1. Definisikan path PDF output (nama konsisten, bukan timestamp)
            $pdfFileName = 'articles_latest.pdf';
            $pdfPath = storage_path('app/public/' . $pdfFileName);

            // 2. Hapus PDF lama jika ada
            if (File::exists($pdfPath)) {
                File::delete($pdfPath);
                \Log::info("PDF lama dihapus: {$pdfPath}");
            }

            // 3. Generate PDF chunks
            $tmp = [];
            Article::with('detail')->orderBy('id')->chunk(200, function ($rows) use (&$tmp) {
                $html = view('pdf.knowledge', ['articles' => $rows])->render();
                $pdf = Pdf::loadHTML($html)->setPaper('a4', 'portrait');
                $path = storage_path('app/tmp/articles_chunk_' . uniqid() . '.pdf');
                $pdf->save($path);
                $tmp[] = $path;
            });

            \Log::info("Total chunks dibuat: " . count($tmp));

            // 4. Merge semua chunks
            $merger = new Merger();
            foreach ($tmp as $f) {
                $merger->addFile($f);
            }
            file_put_contents($pdfPath, $merger->merge());

            \Log::info("PDF berhasil di-merge: {$pdfPath}");

            // 5. Parse PDF untuk ekstrak teks
            $binPath = 'D:\Release-25.12.0-0\poppler-25.12.0\Library\bin\pdftotext.exe';
            $text = \Spatie\PdfToText\Pdf::getText($pdfPath, $binPath);

            \Log::info($text);

            // 6. Bersihkan teks dari watermark
            $cleanedText = str_replace([
                'Powered by TCPDF (www.tcpdf.org)',
                'Powered by TCPDF',
                'www.tcpdf.org'
            ], '', $text);

            // Bersihkan whitespace berlebih
            $cleanedText = trim(preg_replace('/\s+/', ' ', $cleanedText));

            \Log::info("Teks berhasil diekstrak, panjang: " . strlen($cleanedText));

            // 7. PENTING: Clear vector memory lama terlebih dahulu
            $this->clearOldKnowledge();

            // 8. Load ke vector memory agent
            if (!empty($cleanedText)) {
                try {
                    $loadResult = $this->loadToVectorMemory($cleanedText, $pdfFileName);
                    \Log::info("Knowledge berhasil di-load ke vector memory", [
                        'result' => $loadResult,
                        'text_length' => strlen($cleanedText)
                    ]);
                } catch (\Exception $e) {
                    \Log::error("Error loading to vector memory: " . $e->getMessage(), [
                        'trace' => $e->getTraceAsString()
                    ]);
                    throw $e;
                }
            }

            // 9. Cleanup temporary files
            foreach ($tmp as $f) {
                @unlink($f);
            }

            // 10. Simpan metadata sync
            $this->saveSyncMetadata([
                'pdf_file' => $pdfFileName,
                'pdf_path' => $pdfPath,
                'total_articles' => Article::count(),
                'text_length' => strlen($cleanedText),
                'synced_at' => now(),
            ]);

            $this->logSync([
                'pdf_file' => $pdfFileName,
                'pdf_path' => $pdfPath,
                'total_articles' => Article::count(),
                'text_length' => strlen($cleanedText),
            ], true);

            // 11. Return response dengan info
            return response()->json([
                'success' => true,
                'message' => 'Articles berhasil di-sync ke AI Agent',
                'data' => [
                    'pdf_file' => $pdfFileName,
                    'total_articles' => Article::count(),
                    'pdf_size' => File::size($pdfPath),
                    'vector_stats' => $this->agent->vector()->getStatistics(),
                ],
                'download_url' => asset('storage/' . $pdfFileName),
            ]);
        } catch (\Exception $e) {
            \Log::error("Error sync articles: " . $e->getMessage());

            $this->logSync([
                'pdf_file' => $pdfFileName ?? 'unknown',
                'pdf_path' => $pdfPath ?? 'unknown',
                'total_articles' => Article::count(),
                'text_length' => 0,
            ], false, $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Gagal sync articles: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function clearOldKnowledge()
    {
        try {
            // Hapus semua memories dengan source 'articles'
            $deleted = $this->agent->vector()->deleteMemoriesBySource('articles');
            \Log::info("Cleared {$deleted} old memories");

            return $deleted;
        } catch (\Exception $e) {
            \Log::warning("Gagal clear old knowledge: " . $e->getMessage());
            return 0;
        }
    }

    private function loadToVectorMemory(string $text, string $filename)
    {
        $this->agent->vector()->addDocument([
            'content' => $text,
            'metadata' => [
                'source' => 'articles',
                'filename' => $filename,
                'type' => 'knowledge_base',
                'total_articles' => Article::count(),
                'synced_at' => now()->toDateTimeString(),
            ],
            'namespace' => 'default',
            'source' => 'articles', // Penting: untuk bisa delete nanti
        ]);
    }

    private function saveSyncMetadata(array $data)
    {
        // Simpan ke cache untuk tracking
        cache()->put('articles_sync_metadata', $data, now()->addDays(30));

        // Optional: Simpan ke database jika perlu history
        // ArticleSyncLog::create($data);

        \Log::info("Sync metadata saved", $data);
    }

    public function getSyncInfo()
    {
        // 1. Data sync terakhir
        $lastSync = ArticleSyncLog::lastSuccessful();

        // 2. Vector memory stats
        $vectorStats = $this->agent->vector()->getStatistics();

        // 3. Total articles saat ini
        $currentTotalArticles = Article::count();

        // 4. Articles yang sudah di-sync (dari log terakhir)
        $syncedArticlesCount = $lastSync ? $lastSync->total_articles : 0;

        // 5. Hitung selisih (artikel baru/berubah sejak sync terakhir)
        $unsyncedCount = $currentTotalArticles - $syncedArticlesCount;

        // 6. Get artikel terbaru yang belum di-sync
        $unsyncedArticles = [];
        if ($lastSync) {
            $unsyncedArticles = Article::where('updated_at', '>', $lastSync->created_at)
                ->orWhere('created_at', '>', $lastSync->created_at)
                ->select('id', 'name', 'created_at', 'updated_at')
                ->latest()
                ->limit(10) // Ambil 10 terbaru saja untuk preview
                ->get();
        } else {
            // Jika belum pernah sync, ambil 10 artikel terbaru
            $unsyncedArticles = Article::select('id', 'name', 'created_at', 'updated_at')
                ->latest()
                ->limit(10)
                ->get();
        }

        // 7. Tentukan apakah perlu sync
        $needsSync = $this->checkIfNeedsSync($lastSync, $currentTotalArticles);

        return response()->json([
            'sync_status' => [
                'needs_sync' => $needsSync['needs_sync'],
                'reason' => $needsSync['reason'],
                'recommendation' => $needsSync['recommendation'],
            ],

            'last_sync' => [
                'synced_at' => $lastSync ? $lastSync->created_at->format('Y-m-d H:i:s') : null,
                'pdf_file' => $lastSync ? $lastSync->pdf_file : null,
                'total_articles_synced' => $syncedArticlesCount,
                'vector_memories_count' => $lastSync ? $lastSync->vector_memories_count : 0,
                'time_ago' => $lastSync ? $lastSync->created_at->diffForHumans() : 'Belum pernah sync',
            ],

            'current_state' => [
                'total_articles_now' => $currentTotalArticles,
                'unsynced_count' => $unsyncedCount,
                'unsynced_articles_preview' => $unsyncedArticles,
                'vector_memory_stats' => $vectorStats,
            ],

            'statistics' => [
                'total_sync_history' => ArticleSyncLog::count(),
                'successful_syncs' => ArticleSyncLog::where('status', 'success')->count(),
                'failed_syncs' => ArticleSyncLog::where('status', 'failed')->count(),
                'last_failed_sync' => ArticleSyncLog::where('status', 'failed')->latest()->first(),
            ],
        ]);
    }

    public function getUnsyncedArticles(Request $request)
    {
        $lastSync = ArticleSyncLog::lastSuccessful();

        if (!$lastSync) {
            // Belum pernah sync, return semua artikel
            $articles = Article::with('detail')
                ->select('id', 'title', 'created_at', 'updated_at', 'status')
                ->latest()
                ->paginate($request->get('per_page', 20));

            return response()->json([
                'message' => 'Belum pernah sync, menampilkan semua artikel',
                'total_unsynced' => Article::count(),
                'articles' => $articles,
            ]);
        }

        // Get artikel yang dibuat atau diupdate setelah sync terakhir
        $articles = Article::with('detail')
            ->where(function ($query) use ($lastSync) {
                $query->where('created_at', '>', $lastSync->created_at)
                    ->orWhere('updated_at', '>', $lastSync->created_at);
            })
            ->select('id', 'title', 'created_at', 'updated_at', 'status')
            ->latest('updated_at')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'message' => 'Artikel yang belum di-sync',
            'last_sync_at' => $lastSync->created_at->format('Y-m-d H:i:s'),
            'total_unsynced' => $articles->total(),
            'articles' => $articles,
        ]);
    }

    public function getSyncHistory(Request $request)
    {
        $history = ArticleSyncLog::latest()
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'history' => $history,
            'summary' => [
                'total_syncs' => ArticleSyncLog::count(),
                'successful' => ArticleSyncLog::where('status', 'success')->count(),
                'failed' => ArticleSyncLog::where('status', 'failed')->count(),
                'last_sync' => ArticleSyncLog::latest()->first(),
            ],
        ]);
    }

    private function checkIfNeedsSync($lastSync, $currentTotal)
    {
        // 1. Belum pernah sync
        if (!$lastSync) {
            return [
                'needs_sync' => true,
                'reason' => 'Belum pernah melakukan sync',
                'recommendation' => 'Segera lakukan sync pertama kali',
            ];
        }

        // 2. Ada artikel baru atau diupdate
        $hasNewArticles = Article::where('created_at', '>', $lastSync->created_at)->exists();
        $hasUpdatedArticles = Article::where('updated_at', '>', $lastSync->created_at)->exists();

        if ($hasNewArticles || $hasUpdatedArticles) {
            $newCount = Article::where('created_at', '>', $lastSync->created_at)->count();
            $updatedCount = Article::where('updated_at', '>', $lastSync->created_at)
                ->where('created_at', '<=', $lastSync->created_at)
                ->count();

            return [
                'needs_sync' => true,
                'reason' => "Ada {$newCount} artikel baru dan {$updatedCount} artikel yang diupdate",
                'recommendation' => 'Disarankan untuk sync agar agent memiliki data terbaru',
            ];
        }

        // 3. Sync sudah lama (lebih dari 24 jam)
        if ($lastSync->created_at->diffInHours(now()) > 24) {
            return [
                'needs_sync' => true,
                'reason' => 'Sync terakhir sudah lebih dari 24 jam yang lalu',
                'recommendation' => 'Sync berkala untuk memastikan data tetap fresh',
            ];
        }

        // 4. Vector memory kosong tapi ada artikel
        $vectorStats = $this->agent->vector()->getStatistics();
        if ($currentTotal > 0 && ($vectorStats['total_memories'] ?? 0) == 0) {
            return [
                'needs_sync' => true,
                'reason' => 'Vector memory kosong meskipun ada artikel',
                'recommendation' => 'Segera sync untuk mengisi vector memory',
            ];
        }

        // 5. Tidak perlu sync
        return [
            'needs_sync' => false,
            'reason' => 'Data sudah up-to-date',
            'recommendation' => 'Tidak perlu sync saat ini',
        ];
    }

    private function logSync(array $data, bool $success = true, ?string $error = null)
    {
        \App\Models\ArticleSyncLog::create([
            'pdf_file' => $data['pdf_file'],
            'pdf_path' => $data['pdf_path'],
            'total_articles' => $data['total_articles'],
            'text_length' => $data['text_length'],
            'vector_memories_count' => $this->agent->vector()->getStatistics()['total_memories'] ?? 0,
            'status' => $success ? 'success' : 'failed',
            'error_message' => $error,
        ]);
    }


}
