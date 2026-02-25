<?php

namespace App\Services\Reports;

use App\DTO\Base\BaseReportFilterDTO;
use App\DTO\Reports\CompanyReportFilterDTO;
use App\Models\Company;
use App\Services\Reports\Base\BaseReportService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class CompanyReportService extends BaseReportService
{
    protected function getModel(): string
    {
        return Company::class;
    }

    protected function getDateColumn(): string
    {
        return 'created_at';
    }

    protected function applyCustomFilters(Builder $query, BaseReportFilterDTO $dto): void
    {
        if (!$dto instanceof CompanyReportFilterDTO) return;

        if ($dto->isActive !== null) {
            $query->where('is_active', $dto->isActive);
        }
    }

    protected function transformDetailData($item): array
    {
        return [
            'company_name'      => $item->name,
            'email'             => $item->email,
            'status'            => $item->is_active ? 'Active' : 'Inactive',
            'joined_date'       => $item->created_at->format('Y-m-d'),
            'days_since_joined' => (int) $item->days_since_joined, // dari SQL DATEDIFF, bukan PHP
        ];
    }

    /**
     * Override: inject DATEDIFF langsung di SQL, tidak perlu load ke PHP dulu
     */
    public function getDetailData(BaseReportFilterDTO $dto): Collection
    {
        return $this->buildBaseQuery($dto)
            ->selectRaw('*, DATEDIFF(NOW(), created_at) as days_since_joined')
            ->get()
            ->map(fn($item) => $this->transformDetailData($item));
    }

    public function getStatusBreakdown(CompanyReportFilterDTO $dto): array
    {
        $query = $this->buildBaseQuery($dto);

        return [
            'Active'   => (clone $query)->where('is_active', true)->count(),
            'Inactive' => (clone $query)->where('is_active', false)->count(),
        ];
    }

    public function getStatistics(CompanyReportFilterDTO $dto): array
    {
        $query = $this->buildBaseQuery($dto);

        return [
            'total_companies'       => $query->count(),
            'active_companies'      => (clone $query)->where('is_active', true)->count(),
            'inactive_companies'    => (clone $query)->where('is_active', false)->count(),

            // AVG juga pakai SQL DATEDIFF, tidak perlu load semua row ke PHP
            'avg_days_since_joined' => (int) round(
                (clone $query)->reorder()->selectRaw('AVG(DATEDIFF(NOW(), created_at)) as avg_days')->value('avg_days') ?? 0
            ),

            'oldest_company' => (clone $query)->reorder()->oldest('created_at')->first()?->name,
            'newest_company' => (clone $query)->reorder()->latest('created_at')->first()?->name,
        ];
    }

    public function getMonthlyJoinTrend(CompanyReportFilterDTO $dto): array
    {
        return $this->buildBaseQuery($dto)
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as total')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->pluck('total', 'month')
            ->toArray();
    }
}
