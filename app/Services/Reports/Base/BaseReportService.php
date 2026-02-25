<?php

namespace App\Services\Reports\Base;

use App\DTO\Base\BaseReportFilterDTO;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

abstract class BaseReportService
{
    abstract protected function getModel(): string;
    abstract protected function getDateColumn(): string;
    abstract protected function applyCustomFilters(Builder $query, BaseReportFilterDTO $dto): void;
    abstract protected function transformDetailData($item): array;

    public function getDetailData(BaseReportFilterDTO $dto): Collection
    {
        return $this->buildBaseQuery($dto)
            ->get()
            ->map(fn($item) => $this->transformDetailData($item));
    }

    public function getSummaryData(BaseReportFilterDTO $dto, string $groupByColumn): Collection
    {
        return $this->buildBaseQuery($dto)
            ->select($groupByColumn, DB::raw('COUNT(*) as total'))
            ->groupBy($groupByColumn)
            ->get();
    }

    protected function buildBaseQuery(BaseReportFilterDTO $dto): Builder
    {
        $model = $this->getModel();
        $query = $model::query();

        if ($dto->hasDateRange()) {
            $query->whereBetween($this->getDateColumn(), [
                $dto->startDate . ' 00:00:00',
                $dto->endDate   . ' 23:59:59',
            ]);
        }

        $this->applyCustomFilters($query, $dto);
        $query->orderBy($dto->sortBy, $dto->sortDir);

        return $query;
    }

    public function getTotalCount(BaseReportFilterDTO $dto): int
    {
        return $this->buildBaseQuery($dto)->count();
    }

    public function getAggregates(BaseReportFilterDTO $dto, array $columns): array
    {
        $query  = $this->buildBaseQuery($dto);
        $result = [];

        foreach ($columns as $column => $function) {
            $result[$column] = $query->{$function}($column);
        }

        return $result;
    }
}
