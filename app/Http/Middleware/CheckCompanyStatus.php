<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckCompanyStatus
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (!$user || $user->isSuperAdmin()) return $next($request);

        $user->loadMissing('company');

        if ($user->company && !$user->company->is_active) {
            $message = 'Akun perusahaan "' . $user->company->name . '" telah dinonaktifkan oleh administrator.';

            Auth::guard('web')->logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->withErrors(['email' => $message]);
        }

        return $next($request);
    }
}