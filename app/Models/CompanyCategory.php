<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class CompanyCategory extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug'];

    public function companies()
    {
        return $this->hasMany(Company::class);
    }

    public static function store(string $name): self {
        // Validasi nama tidak boleh kosong
        if (empty(trim($name))) {
            throw new \Exception('Category name cannot be empty.');
        }

        // Generate slug dari name
        $slug = Str::slug($name);

        // Cek apakah slug sudah ada
        $existingCategory = self::where('slug', $slug)->first();
        if ($existingCategory) {
            throw new \Exception("Category with slug '{$slug}' already exists.");
        }

        // Create category
        $category = self::create([
            'name' => $name,
            'slug' => $slug
        ]);

        return $category;
    }

    public static function updateCategory(string $name, string $slug): self {
        if (empty(trim($name))) {
            throw new \Exception('Category name cannot be empty.');
        }

        $category = self::where('slug', $slug)->first();

        if (!$category) {
            throw new \Exception("Category with slug '{$slug}' not found.");
        }

        $newSlug = Str::slug($name);

        if ($newSlug !== $slug) {
            $existingCategory = self::where('slug', $newSlug)->where('id', '!=', $category->id)->first();
            if ($existingCategory) {
                throw new \Exception("Category with slug '{$newSlug}' already exists.");
            }
        }

        $category->update([
            'name' => $name,
            'slug' => $newSlug
        ]);

        return $category->fresh();
    }

    public static function destroyCategory(string $slug) {
        // Find category
        $category = self::where('slug', $slug)->first();

        if (!$category) {
            throw new \Exception("Category with slug '{$slug}' not found.");
        }

        // Cek apakah category masih punya relasi dengan companies
        if ($category->companies()->count() > 0) {
            throw new \Exception("Cannot delete category. It has {$category->companies()->count()} associated companies.");
        }

        // Delete category
        return $category->delete();
    }
}