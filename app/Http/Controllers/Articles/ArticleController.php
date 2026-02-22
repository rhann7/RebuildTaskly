<?php

namespace App\Http\Controllers\Articles;

use App\Jobs\ArticleJob;
use App\Models\Article;
use App\Models\ArticleCategory;
use App\Models\ArticleDetail;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Jenssegers\Agent\Agent;

class ArticleController
{
    private $article, $articleDetail;

    public function __construct(
        Article $Article,
        ArticleDetail $ArticleDetail
    ) {
        $this->article = $Article;
        $this->articleDetail = $ArticleDetail;
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
}
