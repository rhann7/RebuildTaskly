<?php

namespace App\Http\Controllers\Companies;

use App\Http\Controllers\Controller;
use App\Models\CompanyCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = CompanyCategory::query()->withCount('companies');

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $categories = $query->orderBy('name', 'asc')->paginate(10)->withQueryString();

        return Inertia::render('companies/category', [
            'categories' => $categories,
            'filters'    => $request->only(['search'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:company_categories,name',
        ]);

        CompanyCategory::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
        ]);

        return redirect()->back()->with('success', 'Category created successfully.');
    }

    public function update(Request $request, CompanyCategory $category)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('company_categories')->ignore($category->id)],
        ]);

        $category->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
        ]);

        return redirect()->back()->with('success', 'Category updated successfully.');
    }

    public function destroy(CompanyCategory $category)
    {
        if ($category->companies()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete category: It is still assigned to some companies.');
        }

        $category->delete();
        return redirect()->back()->with('success', 'Category deleted successfully.');
    }
}