<?php

use App\Http\Controllers\Api\CompanyReportController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('reports/company/export', [CompanyReportController::class, 'export'])
        ->name('reports.company.export');
