<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Support\Facades\Auth;

class ImpersonateController extends Controller
{
    public function takeCompany($id)
    {
        $company = Company::with('companyOwner.user')->findOrFail($id);
        
        $userToImpersonate = $company->companyOwner->user;

        if (!$userToImpersonate) {
            return back()->with('error', 'User tidak ditemukan untuk company ini.');
        }

        Auth::user()->impersonate($userToImpersonate);

        session(['impersonated_company_id' => $company->id]);
        return redirect()->to('/dashboard');
    }

    public function leave()
    {
        if (Auth::user()->isImpersonated()) {
            Auth::user()->leaveImpersonation();
            session()->forget('impersonated_company_id');
        }

        return redirect()->to('/companies');
    }
}