<?php

namespace App\Http\Controllers\Companies; // disesuaikan: masuk namespace Companies

use App\Http\Controllers\Controller;
use App\Models\Company;
use Inertia\Inertia;

class ReportPageController extends Controller
{
    public function company()
    {
        return Inertia::render('reports/companies', [ // halaman baru, bukan companies/index
            'stats' => [
                'total_companies'    => Company::count(),
                'active_companies'   => Company::where('is_active', true)->count(),  // disesuaikan: is_active
                'inactive_companies' => Company::where('is_active', false)->count(), // disesuaikan: is_active
            ],
        ]);
    }
}
