<?php

namespace App\Http\Controllers\Api;

use App\DTO\Reports\CompanyReportFilterDTO;
use App\Exports\Company\CompanyReportExport;
use App\Http\Controllers\Controller;
use App\Services\Reports\CompanyReportService;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class CompanyReportController extends Controller
{
    public function __construct(protected CompanyReportService $service) {}

    public function export(Request $request)
    {
        // Konversi query param 'is_active' (string '1'/'0') ke boolean
        $isActive = match($request->query('is_active')) {
            '1', 'true'  => true,
            '0', 'false' => false,
            default      => null,
        };

        $dto = new CompanyReportFilterDTO(
            startDate: $request->query('start_date'),
            endDate:   $request->query('end_date'),
            isActive:  $isActive,                                // disesuaikan: is_active bukan activeOnly
            sortBy:    $request->query('sort_by', 'created_at'), // disesuaikan: created_at
            sortDir:   $request->query('sort_dir', 'desc')
        );

        return Excel::download(
            new CompanyReportExport($dto, $this->service),
            'company-report-' . now()->format('Y-m-d-His') . '.xlsx',
            \Maatwebsite\Excel\Excel::XLSX,
            ['charts' => true]
        );
    }
}
