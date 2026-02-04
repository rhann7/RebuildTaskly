<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Models\Company; 
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class CheckCompanyPermission
{
   public function handle(Request $request, Closure $next, ?string $permission = null)
    {
        $user = $request->user();
        if (!$user) abort(403);

        if ($user->isSuperAdmin()) return $next($request);

        // Sekarang ini bakal jalan buat bedul karena relasi di model sudah kita benerin
        $company = $user->company; 
        
        // Kalau masih null, kita paksa cari pake ID
        if (!$company && $user->company_id) {
            $company = \App\Models\Company::find($user->company_id);
        }

        abort_if(!$company, 403, 'Akun anda tidak terhubung dengan perusahaan.');

        // Cek Permission via si Owner (jewcompoy)
        $owner = \App\Models\User::role('company')
            ->where('company_id', $user->company_id)
            ->first();

        // Ambil permissions (Cache 1 menit aja biar gak pusing pas edit DB)
        $permissions = Cache::remember("company_perms_{$user->company_id}", 60, function () use ($owner) {
            return $owner ? $owner->getAllPermissions() : collect();
        });

        $routeName = $request->route()->getName();

        foreach ($permissions as $p) {
            // Cek Route tunggal
            if ($p->route_name === $routeName) return $next($request);

            // Cek Group (workspaces.* dll)
            if ($p->isGroup && $p->group_routes) {
                $patterns = is_array($p->group_routes) ? $p->group_routes : json_decode($p->group_routes, true);
                if (is_array($patterns) && $request->routeIs($patterns)) return $next($request);
            }
        }

        abort(403, "Perusahaan tidak memiliki akses fitur: {$routeName}");
    }
}