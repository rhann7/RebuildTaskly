<?php

namespace App\Providers;

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
    }
}