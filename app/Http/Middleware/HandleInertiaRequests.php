<?php

namespace App\Http\Middleware;

use App\Models\CompanyCategory;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $user ? [
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->getRoleNames(),
                    'company' => $user->companyOwner,
                    'permissions' => $user->getAllPermissions()->pluck('name'),
                ] : null,
                'is_impersonating' => app('impersonate')->isImpersonating()
            ],
            'categories' => fn () => $request->routeIs('register')
                ? CompanyCategory::select(['id', 'name'])->get()
                : [],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}