<?php

use App\Http\Controllers\Companies\CategoryController;
use App\Http\Controllers\Companies\CompanyController;
use App\Http\Controllers\Rules\PermissionAccessController;
use App\Http\Controllers\Rules\PermissionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::impersonate();
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    
    Route::middleware('role:admin')->group(function () {
        Route::prefix('access-control')->name('access-control.')->group(function () {
            Route::resource('permissions', PermissionController::class);

            Route::get('company-access', [PermissionAccessController::class, 'index'])->name('company-access.index');
            Route::post('company-access/{company}', [PermissionAccessController::class, 'update'])->name('company-access.update');
        });

        Route::prefix('company-management')->name('company-management.')->group(function () {
            Route::resource('categories', CategoryController::class)
                ->names('categories')
                ->parameters(['categories' => 'category'])
                ->except(['create', 'edit', 'show']);

            Route::resource('companies', CompanyController::class)
                ->except(['show']);
                
            Route::get('/companies/{company:slug}', [CompanyController::class, 'show'])->name('show');
        });
    });

    Route::get('can-view-analytics', function () {
        return "<h1>Tes halaman company dengan general permission: can-view-analytics</h1>";
    })->middleware('company_can:can-view-analytics');
    
    Route::get('can-edit-company', function () {
        return "<h1>Tes halaman company dengan general permission: can-edit-company</h1>";
    })->middleware('company_can:can-edit-company');
});

require __DIR__.'/settings.php';