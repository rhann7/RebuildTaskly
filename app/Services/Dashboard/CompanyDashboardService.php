<?php

namespace App\Services\Dashboard;

use App\Models\Company;
use App\Services\Dashboard\Base\BaseDashboardService;
use Carbon\Carbon;

class CompanyDashboardService extends BaseDashboardService
{
    protected string $model = Company::class;
    protected string $dateColumn = 'created_at'; // Company pakai created_at, bukan joined_at

    public function getKpiMetrics(): array
    {
        return [
            'total_companies' => [
                'label' => 'Total Companies',
            ],
            'active_companies' => [
                'label' => 'Active Companies',
                'accent' => 'text-green-600',
                'query' => fn($q) => $q->where('is_active', true)->count(), // pakai is_active boolean
            ],
            'inactive_companies' => [
                'label' => 'Inactive Companies',
                'accent' => 'text-red-600',
                'query' => fn($q) => $q->where('is_active', false)->count(),
            ],
        ];
    }

    public function getChartConfigs(): array
    {
        return [
            'monthly_growth' => [
                'label' => 'Company Growth (Monthly)',
                'period' => 'month',
                'type'   => 'line',
            ],
        ];
    }

    /**
     * Get newest companies dalam filter period
     */
    public function getNewestCompanies(?array $filters = null, int $limit = 5): array
    {
        $query = $this->getBaseQuery();
        $this->applyDateFilter($query, $filters);

        return $query
            ->latest('created_at') // pakai created_at
            ->limit($limit)
            ->get()
            ->map(fn($company) => [
                'name'      => $company->name,
                'email'     => $company->email,
                'status'    => $company->is_active ? 'Active' : 'Inactive', // dari is_active boolean
                'joined_at' => $company->created_at->format('d M Y'),
                'days_ago'  => (int) $company->created_at->diffInDays(now()),
            ])
            ->toArray();
    }

    /**
     * Get company growth rate — current period vs previous period
     */
    public function getGrowthRate(?array $filters = null): array
    {
        if (!$filters || empty($filters['from']) || empty($filters['to'])) {
            return ['current_period' => 0, 'previous_period' => 0, 'growth_rate' => 0];
        }

        $from = Carbon::parse($filters['from']);
        $to   = Carbon::parse($filters['to']);
        $diff = $from->diffInDays($to);

        $current = $this->getBaseQuery()
            ->whereBetween($this->dateColumn, [$from->copy()->startOfDay(), $to->copy()->endOfDay()])
            ->count();

        $previousFrom = $from->copy()->subDays($diff + 1);
        $previousTo   = $from->copy()->subDay();

        $previous = $this->getBaseQuery()
            ->whereBetween($this->dateColumn, [$previousFrom->startOfDay(), $previousTo->endOfDay()])
            ->count();

        return [
            'current_period'  => $current,
            'previous_period' => $previous,
            'growth_rate'     => $previous > 0
                ? round((($current - $previous) / $previous) * 100, 2)
                : ($current > 0 ? 100 : 0),
        ];
    }
}
