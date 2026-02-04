<?php

namespace App\Http\Middleware;

use App\Models\CompanyAppeal;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckCompanyStatus
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (!$user || $user->isSuperAdmin()) return $next($request);

        if ($request->routeIs('appeals.*')) return $next($request);

        $user->loadMissing('company');

        if ($user->company && !$user->company->is_active) {
            if ($request->header('X-Inertia')) {
                return inertia()->location(route('appeals.create'));
            }

            $reason = $user->company->reason ?? 'Pelanggaran kebijakan atau masalah administratif.';
            session()->flash('warning_message', "Akses Dibatasi: Akun Anda ditangguhkan karena: {$reason}");

            return redirect()->route('appeals.create');
        }

        $lastAppeal = CompanyAppeal::where('company_id', $user->company->id)
            ->latest()
            ->first();

        if ($lastAppeal && $lastAppeal->status === 'approved' && !$request->session()->has('notified_approval')) {
            session()->flash('success', "Banding Anda telah diterima. Alasan: " . ($lastAppeal->reason ?? 'Akun telah diaktifkan kembali.'));
            session()->put('notified_approval', true);
        }

        return $next($request);
    }
}