<?php

use App\Http\Controllers\Companies\CategoryController;
use App\Http\Controllers\Companies\CompanyController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProjectManagement\Projects\ProjectController;
use App\Http\Controllers\Rules\PermissionAccessController;
use App\Http\Controllers\Rules\PermissionController;
use App\Http\Controllers\TaskManagement\SubTasks\SubTaskController;
use App\Http\Controllers\TaskManagement\Tasks\TaskController;
use App\Http\Controllers\TaskManagement\TimesheetController;
use App\Http\Controllers\Workspaces\WorkspaceController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Spatie\Permission\Models\Permission;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\TaskManagement\TaskDocumentController;


Route::get('/', function () {
    return Inertia::render('welcome', ['canRegister' => Features::enabled(Features::registration())]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/team', [TeamController::class, 'index'])->name('team.index');
    Route::post('/team', [TeamController::class, 'store'])->name('team.store');
    Route::middleware(['auth', 'verified', 'company_can'])->group(function () {
        Route::get('/projects', [ProjectController::class, 'globalIndex'])
            ->name('projects.global');
        Route::resource('timesheets', TimesheetController::class)
            ->only(['index', 'store', 'destroy']);
    });
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
    });

    Route::middleware('company_can')->group(function () {
        Route::post('workspaces/{workspace:slug}/members', [WorkspaceController::class, 'addMember'])
            ->name('workspaces.members.add');
        Route::resource('workspaces', WorkspaceController::class)
            ->parameters(['workspaces' => 'workspace:slug'])
            ->except(['create', 'edit']);

        Route::resource('workspaces.projects', ProjectController::class)
            ->parameters([
                'workspaces' => 'workspace:slug',
                'projects' => 'project:slug'
            ])
            ->except(['create', 'edit']);

        Route::post('workspaces/{workspace:slug}/projects/{project}/members', [ProjectController::class, 'addMember'])
            ->name('workspaces.projects.members.store');

        Route::delete('workspaces/{workspace:slug}/projects/{project}/members/{user}', [ProjectController::class, 'removeMember'])
            ->name('workspaces.projects.members.destroy');

        Route::resource('workspaces.projects.tasks', TaskController::class)
            ->parameters([
                'workspaces' => 'workspace:slug',
                'projects' => 'project:slug',
                'tasks' => 'task:slug'
            ])
            ->except([]);

        Route::resource('workspaces.projects.tasks.subtasks', SubTaskController::class)
            ->parameters([
                'workspaces' => 'workspace:slug',
                'projects' => 'project:slug',
                'tasks' => 'task:slug',
                'subtasks' => 'subTask'
            ])
            ->only(['store', 'destroy']);

            Route::post('workspaces/{workspace:slug}/projects/{project:slug}/tasks/{task:slug}/documents', [TaskDocumentController::class, 'store'])
            ->name('workspaces.projects.tasks.documents.store');

            Route::delete('documents/{document}', [TaskDocumentController::class, 'destroy'])
            ->name('workspaces.projects.tasks.documents.destroy');

        Route::patch(
            'workspaces/{workspace:slug}/projects/{project:slug}/tasks/{task:slug}/subtasks/{subTask}/toggle',
            [SubTaskController::class, 'toggle']
        )
            ->name('workspaces.projects.tasks.subtasks.toggle');

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
