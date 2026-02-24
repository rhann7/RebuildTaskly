<?php

namespace App\Http\Middleware;

use App\Models\CompanyCategory;
use App\Models\User; // Tambahkan import ini
use App\Services\MenuService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Illuminate\Support\Facades\Cache;

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
        
        // Inisialisasi array permission
        $mergedPermissions = [];

        if ($user) {
            // Logic baru: Ambil permission user itu sendiri
            $userPermissions = $user->getAllPermissions()->pluck('name')->toArray();

            // Cari siapa "Owner" dari perusahaan tempat user ini bernaung
            // Kita filter berdasarkan company_id yang sama dan role 'company'
            $companyOwner = User::role('company')
                ->where('company_id', $user->company_id)
                ->first();

            $companyPermissions = [];
            if ($companyOwner) {
                // Ambil permission yang diberikan Super Admin ke si Owner/Company
                $companyPermissions = $companyOwner->getAllPermissions()->pluck('name')->toArray();
            }

            // Gabungkan (Merge) dan buang duplikatnya
            $mergedPermissions = array_unique(array_merge($userPermissions, $companyPermissions));
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $user ? [
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->getRoleNames(),
                    'permissions' => $mergedPermissions, // Hasil merge tadi dimasukkan ke sini
                    'company' => $user->company_id,
                    'menu' => (new MenuService())->getSidebarMenu($request),
                ] : null,
                'is_impersonating' => app('impersonate')->isImpersonating()
            ],
            'flash' => [
            'success' => $request->session()->get('success'),
            'error' => $request->session()->get('error'),
            ],
            'categories' => fn () => $request->routeIs('register')
                ? CompanyCategory::select(['id', 'name'])->get()
                : [],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}