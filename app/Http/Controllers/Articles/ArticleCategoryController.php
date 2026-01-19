<?php

namespace App\Http\Controllers\Articles;

use App\Http\Controllers\Controller;
use App\Models\ArticleCategory;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ArticleCategoryController extends Controller
{
    private $articleCategory;

    public function __construct(ArticleCategory $articleCategory)
    {
        $this->articleCategory = $articleCategory;
    }

    public function index(Request $request)
    {
        $query = ArticleCategory::query()->withCount('articles');

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $categories = $query->orderBy('id', 'desc')->paginate(10)->withQueryString();

        return Inertia::render('article/category', [
            'categories' => $categories,
            'filters'    => $request->only(['search'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:article_categories,name',
        ]);

        $this->articleCategory::store([
            'name' => $validated['name'],
            'created_by' => auth()->user()->name,
        ]);

        return redirect()->back()->with('success', 'Category created successfully.');
    }

    public function update(Request $request, ArticleCategory $category)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('article_categories')->ignore($category->id)],
        ]);

        $category->updateCategory([
            'name' => $validated['name'],
            'updated_by' => auth()->user()->name,
        ]);

        return redirect()->back()->with('success', 'Category updated successfully.');
    }

    public function destroy(ArticleCategory $category)
    {
        if (!$category->destroyArticle()) {
            return redirect()->back()->with('error', 'Cannot delete category: It is still assigned to some articles.');
        }

        return redirect()->back()->with('success', 'Category deleted successfully.');
    }
}
