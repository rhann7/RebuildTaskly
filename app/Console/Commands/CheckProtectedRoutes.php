<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission;

class CheckProtectedRoutes extends Command
{
    protected $signature = 'app:check-routes';
    protected $description = 'List all routes and their protection status';

    public function handle()
    {
        $permissions = Permission::all();   
        $routes = collect(Route::getRoutes());
        $data = [];

        foreach ($routes as $route) {
            $routeName = $route->getName();
            if (!$routeName) continue;

            $guardingPermission = $permissions->first(function ($p) use ($routeName) {
                if ($p->route_name === $routeName) return true;

                if ($p->isGroup && !empty($p->group_routes)) {
                    $patterns = is_array($p->group_routes) ? $p->group_routes : json_decode($p->group_routes, true);
                    foreach ($patterns ?? [] as $pattern) {
                        if (Str::is($pattern, $routeName)) return true;
                    }
                }
                return false;
            });

            $data[] = [
                'Method' => implode('|', $route->methods()),
                'URI' => $route->uri(),
                'Route Name' => $routeName,
                'Status' => $guardingPermission ? '<fg=green>PROTECTED</>' : '<fg=yellow>PUBLIC/OPEN</>',
                'Guarded By' => $guardingPermission ? $guardingPermission->name : '-',
            ];
        }

        $this->table(['Method', 'URI', 'Route Name', 'Status', 'Guarded By'], $data);
    }
}