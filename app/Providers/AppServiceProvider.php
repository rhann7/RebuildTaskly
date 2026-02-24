<?php

namespace App\Providers;

use App\Models\Company;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $path = database_path('migrations');
        $paths = array_merge([$path], glob($path . '/*', GLOB_ONLYDIR));
        $this->loadMigrationsFrom($paths);

        Gate::before(function ($user, $ability) {
            return $user->isSuperAdmin() ? true : null;
        });

        Company::observe(\App\Observers\CompanyObserver::class);

        if (app()->environment('local') && str_contains(request()->getHost(), 'ngrok')) {
            \URL::forceScheme('https');
        }
    }
}
