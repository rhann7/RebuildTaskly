<?php

use App\Http\Controllers\Companies\CategoryController;
use App\Http\Controllers\Companies\CompanyController;
use App\Http\Controllers\Rules\PermissionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    
    Route::middleware('role:admin')->group(function () {
        Route::prefix('access-control')->name('access-control.')->group(function () {
            Route::resource('permissions', PermissionController::class);
        });

        Route::resource('company-categories', CategoryController::class)
            ->names('companies.categories')
            ->parameters(['company-categories' => 'category'])
            ->except(['create', 'edit', 'show']);

        Route::resource('companies', CompanyController::class)
            ->except(['show']);
            
        Route::get('/companies/{company:slug}', [CompanyController::class, 'show'])->name('companies.show');
    });

    Route::get('manage-company', function () {
        return "<h1>Tes halaman company dengan general permission: manage-company</h1>";
    })->middleware('company_can:manage-company');
    
    Route::get('manage-workspace', function () {
        return "<h1>Tes halaman company dengan general permission: manage-workspace</h1>";
    })->middleware('company_can:manage-workspace');

    Route::get('view-analytics', function () {
        return "<h1>Tes halaman company dengan unique permission: view-analytics</h1>";
    })->middleware('company_can:view-analytics');
});

require __DIR__.'/settings.php';