<?php

use App\Http\Controllers\Companies\CategoryController;
use App\Http\Controllers\Companies\CompanyController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Rules\PermissionAccessController;
use App\Http\Controllers\Rules\PermissionController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Spatie\Permission\Models\Permission;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware('auth')->group(function () {
    Route::impersonate();
});

if (Schema::hasTable('permissions')) {
    $dynamicRoutes = cache()->rememberForever('dynamic_routes', function () {
        return Permission::whereNotNull('route_path')->get();
    });

    foreach ($dynamicRoutes as $route) {
        if ($route->route_path && $route->controller_action) {
            Route::get($route->route_path, $route->controller_action)
                ->name($route->route_name)
                ->middleware(['auth', 'verified', "company_can:{$route->name}"]);
        }
    }
}

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    Route::middleware('role:super-admin')->group(function () {
        Route::prefix('access-control')->name('access-control.')->group(function () {
            Route::resource('permissions', PermissionController::class);

            Route::get('company-access', [PermissionAccessController::class, 'index'])->name('company-access.index');
            Route::post('company-access/{company}', [PermissionAccessController::class, 'update'])->name('company-access.update');
        });

        Route::prefix('company-management')->name('company-management.')->group(function () {
            Route::resource('categories', CategoryController::class)
                ->parameters(['categories' => 'category:slug'])
                ->except(['create', 'edit', 'show']);

            Route::resource('companies', CompanyController::class)
                ->parameters(['companies' => 'company:slug']);
        });
    });
});

require __DIR__.'/settings.php';