<?php

use App\Http\Controllers\Companies\CategoryController;
use App\Http\Controllers\Companies\CompanyAppealController;
use App\Http\Controllers\Companies\CompanyController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Modules\ModuleController;
use App\Http\Controllers\Plans\PlanController;
use App\Http\Controllers\Rules\PermissionController;
use App\Http\Controllers\Subscriptions\SubscriptionController;
use App\Http\Controllers\Workspaces\WorkspaceController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', ['canRegister' => Features::enabled(Features::registration())]);
})->name('home');


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::impersonate();

    Route::resource('appeals', CompanyAppealController::class)
        ->only(['create', 'store']);
        
    Route::middleware('role:super-admin')->group(function () {
        Route::prefix('access-control')->name('access-control.')->group(function () {
            Route::resource('permissions', PermissionController::class);
        });

        Route::prefix('product-management')->name('product-management.')->group(function () {
            Route::resource('modules', ModuleController::class)
                ->parameters(['modules' => 'module:slug']);

            Route::post('modules/{module}/permissions', [ModuleController::class, 'assignPermissions'])
                ->name('modules.permissions.assign');
            Route::delete('permissions/{permission}', [ModuleController::class, 'removePermission'])
                ->name('modules.permissions.remove');
                
            Route::resource('plans', PlanController::class)
                ->parameters(['plans' => 'plan:slug']);

            Route::post('plans/{plan}/modules', [PlanController::class, 'assignModules'])
                ->name('plans.modules.assign')  ;
            Route::delete('plans/{plan}/modules/{module}', [PlanController::class, 'removeModule'])
                ->name('plans.modules.remove');

            Route::get('subscriptions', [SubscriptionController::class, 'index'])
                ->name('subscriptions.index');
        });

        Route::prefix('company-management')->name('company-management.')->group(function () {
            Route::resource('categories', CategoryController::class)
                ->parameters(['categories' => 'category:slug'])
                ->except(['create', 'edit', 'show']);

            Route::resource('companies', CompanyController::class)
                ->parameters(['companies' => 'company:slug'])
                ->except(['create', 'edit']);
            
            Route::resource('appeals', CompanyAppealController::class)
                ->only(['index', 'update']);
        });
    });

    Route::middleware(['company_status', 'company_can'])->group(function () {
        Route::resource('workspaces', WorkspaceController::class)
            ->parameters(['workspaces' => 'workspace:slug'])
            ->except(['create', 'edit']);
    });
});

require __DIR__.'/settings.php';