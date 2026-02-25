<?php

use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Companies\CategoryController;
use App\Http\Controllers\Companies\CompanyAppealController;
use App\Http\Controllers\Companies\CompanyController;
use App\Http\Controllers\Companies\CompanyDashboardController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Invoices\InvoiceController;
use App\Http\Controllers\Modules\ModuleController;
use App\Http\Controllers\Payments\InvoiceAddOnPaymentController;
use App\Http\Controllers\Plans\PlanController;
use App\Http\Controllers\Rules\PermissionController;
use App\Http\Controllers\Subscriptions\SubscriptionController;
use App\Http\Controllers\Tickets\TicketController;
use App\Http\Controllers\Workspaces\WorkspaceController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', ['canRegister' => Features::enabled(Features::registration())]);
})->name('home');

// Route to redirect to Google's OAuth page
Route::get('auth/google/redirect', [GoogleAuthController::class, 'redirect'])->name('auth.google.redirect');

Route::get('auth/google/callback', [GoogleAuthController::class, 'callback'])->name('auth.google.callback');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

        Route::impersonate();

        Route::resource('appeals', CompanyAppealController::class)
        ->only(['create', 'store']);

    Route::get('plans/pricing', [PlanController::class, 'pricing'])
        ->name('plans.pricing');

    Route::get('billings', [SubscriptionController::class, 'billing'])
        ->name('billings');

    Route::post('invoices/callback', [InvoiceController::class, 'callback'])
        ->name('invoices.callback')
        ->withoutMiddleware(['auth', 'verified']);

    Route::resource('invoices', InvoiceController::class)
        ->only(['store', 'show']);

        Route::get('invoices/{invoice}/create', [InvoiceController::class, 'create'])
        ->name('invoices.create');

        Route::patch('invoices/{invoice}/cancel', [InvoiceController::class, 'cancel'])
        ->name('invoices.cancel');

        Route::post('invoices/{invoice}/payment', [InvoiceController::class, 'createPayment'])
        ->name('invoices.payment');

        Route::middleware('role:super-admin')->group(function () {
            Route::get('dashboard/companies', [CompanyDashboardController::class, 'index'])
                ->name('company-management.dashboard');

            Route::prefix('access-control')->name('access-control.')->group(function () {
            Route::resource('permissions', PermissionController::class);
        });

        Route::post('tickets/{ticket}/assign', [TicketController::class, 'assign'])
            ->name('tickets.assign');

        Route::patch('tickets/{ticket}/status', [TicketController::class, 'updateStatus'])
            ->name('tickets.status');

        Route::post('tickets/{ticket}/proposal', [TicketController::class, 'storeProposal'])
            ->name('tickets.proposal.store');

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
                ->name('plans.modules.assign');
            Route::delete('plans/{plan}/modules/{module}', [PlanController::class, 'removeModule'])
                ->name('plans.modules.remove');

            Route::resource('subscriptions', SubscriptionController::class)
                ->only(['index', 'show']);
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

            Route::prefix('reports')->name('reports.')->group(function () {
                Route::get('company', [\App\Http\Controllers\Companies\ReportPageController::class, 'company'])
                    ->name('company');
            });
        });
    });

    Route::middleware(['company_status', 'company_can'])->group(function () {
        Route::resource('invoices', InvoiceController::class)
            ->only(['index']);

        Route::resource('workspaces', WorkspaceController::class)
            ->parameters(['workspaces' => 'workspace:slug'])
            ->except(['create', 'edit']);

        Route::get('test', function () {
            return Inertia::render('example/index');
        })->name('test');

        Route::resource('tickets', TicketController::class)
            ->only(['index', 'show', 'create', 'store']);

        Route::post('tickets/{ticket}/message', [TicketController::class, 'sendMessage'])
            ->name('tickets.message');

        Route::post('tickets/{ticket}/proposal/approve', [TicketController::class, 'approveProposal'])
            ->name('tickets.proposal.approve');

        // Add-on payment routes — ikuti pola invoices (show → create → pay)
        Route::get('invoice-addons/{invoiceAddOn}', [InvoiceAddOnPaymentController::class, 'show'])
            ->name('payments.addon.show');

        Route::get('invoice-addons/{invoiceAddOn}/create', [InvoiceAddOnPaymentController::class, 'create'])
            ->name('payments.addon.create');

        Route::post('invoice-addons/{invoiceAddOn}/pay', [InvoiceAddOnPaymentController::class, 'createPayment'])
            ->name('payments.addon.pay');

        Route::post('invoice-addons/callback', [TicketController::class, 'addOnCallback'])
            ->name('payments.addon.callback')
            ->withoutMiddleware(['auth', 'verified']);
    });
});

require __DIR__ . '/settings.php';
