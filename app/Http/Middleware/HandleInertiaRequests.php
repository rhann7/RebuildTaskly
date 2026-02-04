<?php

namespace App\Http\Middleware;

use App\Models\CompanyCategory;
use App\Services\MenuService;
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
        if ($user) $user->loadMissing('company');

        $company = $user?->company;

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
            ],
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->getRoleNames(),
                    'permissions' => array_unique(array_merge(
                        $user->getAllPermissions()->pluck('name')->toArray(),
                        $company ? $company->getAllPermissions()->pluck('name')->toArray() : []
                    )),
                    'company' => $company ? [
                        'id' => $company->id,
                        'name' => $company->name,
                        'logo' => $company->logo ? asset('storage/' . $company->logo) : null,
                        'slug' => $company->slug,
                    ] : null,
                    'menu' => (new MenuService())->getSidebarMenu($request),
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