<?php

use App\Http\Controllers\Agentic\AgentController;
use App\Http\Controllers\Articles\ArticleCategoryController;
use App\Http\Controllers\Articles\ArticleController;
use App\Http\Controllers\Chatbot\ChatbotController;
use App\Http\Controllers\Companies\CategoryController;
use App\Http\Controllers\Companies\CompanyController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Rules\PermissionAccessController;
use App\Http\Controllers\Rules\PermissionController;
use App\Http\Controllers\Workspaces\WorkspaceController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Spatie\Permission\Models\Permission;

Route::get('/', function () {
    return Inertia::render('welcome', ['canRegister' => Features::enabled(Features::registration())]);
})->name('home');

Route::get('/csrf-token', function () {
    return response()->json(['csrf_token' => csrf_token()]);
});

Route::middleware(['auth'])->group(function () {
    Route::impersonate();
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Article Center Routes (Public Help Center)
    Route::get('/article-center', [\App\Http\Controllers\Articles\ArticleCenterController::class, 'index'])->name('article-center.index');
    Route::get('/article-center/{article}', [\App\Http\Controllers\Articles\ArticleCenterController::class, 'show'])->name('article-center.show');

    Route::impersonate();

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

        Route::prefix('article-management')->name('article-management.')->group(function () {
            // Article Analytics Routes
            Route::get('/analytics', [\App\Http\Controllers\Articles\ArticleAnalyticController::class, 'index'])->name('article-analytics.index');

            Route::resource('category', ArticleCategoryController::class)
                ->names('category')
                ->parameters(['category' => 'category'])
                ->except(['create', 'edit', 'show']);

            Route::resource('article', ArticleController::class);
            Route::put('/article/{article}/status', [ArticleController::class, 'updateStatusArticle'])->name('article.status');
        });
    });

    Route::middleware('company_can')->group(function () {
        Route::resource('workspaces', WorkspaceController::class)
            ->parameters(['workspaces' => 'workspace:slug'])
            ->except(['create', 'edit']);

        if (Schema::hasTable('permissions') && Schema::hasColumns('permissions', ['route_path', 'route_name'])) {
            $dynamicRoutes = cache()->remember('dynamic_routes', 3600, function () {
                return Permission::whereNotNull('route_path')->whereNotNull('route_name')->get();
            });

            foreach ($dynamicRoutes as $route) {
                if (!Route::has($route->route_name)) {
                    Route::get($route->route_path, $route->controller_action)
                        ->name($route->route_name);
                }
            }
        }
    });
});

require __DIR__ . '/settings.php';
