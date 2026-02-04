<?php

namespace App\Observers;

use App\Models\Company;
use App\Models\CompanyAppealLog;
use Illuminate\Support\Facades\Auth;

class CompanyObserver
{
    public function updated(Company $company): void
    {
        if ($company->isDirty('is_active')) {
            CompanyAppealLog::create([
                'company_id' => $company->id,
                'user_id'    => Auth::id() ?? $company->updated_by,
                'status_to'  => $company->is_active ? 'active' : 'suspended',
                'reason'     => $company->reason,
            ]);
        }
    }
}