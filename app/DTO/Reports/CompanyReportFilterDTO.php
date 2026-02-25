<?php

namespace App\DTO\Reports;

use App\DTO\Base\BaseReportFilterDTO;

class CompanyReportFilterDTO extends BaseReportFilterDTO
{
    public function __construct(
        ?string $startDate = null,
        ?string $endDate = null,
        public ?bool $isActive = null,   // disesuaikan: is_active boolean bukan status string
        ?string $sortBy = 'created_at',  // disesuaikan: created_at bukan joined_at
        ?string $sortDir = 'desc'
    ) {
        parent::__construct($startDate, $endDate, $sortBy, $sortDir);
    }

    public function toArray(): array
    {
        return array_merge(parent::toArray(), array_filter([
            'is_active' => $this->isActive,
        ], fn($value) => $value !== null));
    }
}
