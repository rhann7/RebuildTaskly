<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MenuService
{
    public function getSidebarMenu(Request $request)
    {
        $user = $request->user();
        if (!$user) return [];

        $menu = [];

        // 1. Dashboard (Default untuk semua)
        $menu[] = [
            'title'    => 'Dashboard',
            'href'     => '/dashboard',
            'icon'     => 'LayoutGrid',
            'isActive' => $request->routeIs('dashboard'),
        ];

        // 2. Logic Khusus Super Admin
        if ($user->hasRole('super-admin')) {
            $menu[] = [
                'title'    => 'Company Management',
                'href'     => '#',
                'icon'     => 'Building2',
                'isActive' => $request->routeIs('company-management.*'),
                'items'    => [
                    ['title' => 'Categories', 'href' => '/company-management/categories', 'isActive' => $request->routeIs('company-management.categories.*')],
                    ['title' => 'Companies', 'href' => '/company-management/companies', 'isActive' => $request->routeIs('company-management.companies.*')],
                ]
            ];

            $menu[] = [
                'title'    => 'Access Control',
                'href'     => '#',
                'icon'     => 'ShieldCheck',
                'isActive' => $request->routeIs('access-control.*'),
                'items'    => [
                    ['title' => 'Permissions', 'href' => '/access-control/permissions', 'isActive' => $request->routeIs('access-control.permissions.*')],
                    ['title' => 'Company Access', 'href' => '/access-control/company-access', 'isActive' => $request->routeIs('access-control.company-access.*')],
                ]
            ];

            $menu[] = [
                'title'    => 'Workspaces Management',
                'href'     => '/workspaces',
                'icon'     => 'Briefcase',
                'isActive' => $request->routeIs('workspaces.index'),
            ];

            return $menu;
        }

        // 3. LOGIC INHERITANCE (MANAGER/MEMBER NYONTEK PERMISSION BOSS)

        // Cari ID Owner (Role Company) di perusahaan yang sama
        $owner = User::role('company')
            ->where('company_id', $user->company_id)
            ->first();

        $allPermissions = collect();

        if ($owner) {
            // Ambil ID Permission dari Direct Permissions milik Owner
            $directPermissionIds = DB::table('model_has_permissions')
                ->where('model_id', $owner->id)
                ->pluck('permission_id');

            // Ambil ID Permission dari Role milik Owner
            $rolePermissionIds = DB::table('role_has_permissions')
                ->join('model_has_roles', 'role_has_permissions.role_id', '=', 'model_has_roles.role_id')
                ->where('model_has_roles.model_id', $owner->id)
                ->pluck('permission_id');

            // Gabungkan semua ID unik
            $mergedIds = $directPermissionIds->merge($rolePermissionIds)->unique();

            // Tarik data lengkap dari tabel permissions yang isMenu-nya aktif (1)
            $allPermissions = DB::table('permissions')
                ->whereIn('id', $mergedIds)
                ->where('isMenu', 1)
                ->orderBy('id')
                ->get();
        }

        // DEBUG KE LOG (Cek storage/logs/laravel.log)
        Log::info("Sidebar Build for: " . $user->name);
        Log::info("Owner Found: " . ($owner ? $owner->name : 'NONE'));
        Log::info("Permissions Count: " . $allPermissions->count());

        // 4. Generate Menu Array
        foreach ($allPermissions as $p) {
            $href = '#';

            // --- LOGIC PERBAIKAN UNTUK ROUTE YANG BUTUH PARAMETER ---
            // Jika route_name adalah 'workspaces.team-performance', 
            // kita harus memastikan kita sedang berada di dalam halaman Workspace
            if ($p->route_name === 'workspaces.team-performance') {
                $workspace = $request->route('workspace'); // Ambil parameter dari URL saat ini

                // Jika sedang TIDAK berada di dalam workspace (misal di halaman /tasks), SKIP menu ini
                if (!$workspace) {
                    continue;
                }

                // Jika ada, generate route-nya
                $workspaceSlug = is_object($workspace) ? $workspace->slug : $workspace;
                $href = route($p->route_name, ['workspace' => $workspaceSlug]);
            } else {
                // Logic default untuk menu-menu lainnya yang tidak butuh parameter
                if ($p->route_name && Route::has($p->route_name)) {
                    $href = route($p->route_name);
                } elseif ($p->route_path) {
                    $href = url($p->route_path);
                }
            }
            // --------------------------------------------------------

            $menu[] = [
                'title'    => Str::headline($p->name),
                'href'     => $href,
                'icon'     => $p->icon ?? 'Circle',
                'isActive' => $p->route_name ? $request->routeIs($p->route_name . '*') : false,
            ];
        }

        

        return $menu;
    }
}
