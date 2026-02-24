<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\Invoice;
use App\Models\Subscription;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(function () {
    Invoice::unpaid()
        ->where('due_date', '<', now())
        ->update(['status' => 'expired']);
})->everyMinute()->name('expire-invoices');

Schedule::call(function () {
    Subscription::where('status', 'active')
        ->where('ends_at', '<', now())
        ->update(['status' => 'expired']);
})->everyMinute()->name('expire-subscriptions');