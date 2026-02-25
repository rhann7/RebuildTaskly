<?php

namespace App\Exports\Base\Sheets;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

abstract class BaseDetailSheet implements FromCollection, WithHeadings, WithEvents, WithTitle, WithStyles
{
    protected $service;
    protected $dto;
    protected $data;

    public function __construct($service, $dto)
    {
        $this->service = $service;
        $this->dto     = $dto;
        $this->data    = $this->loadData();
    }

    abstract protected function loadData();
    abstract protected function getColumns(): array;
    abstract protected function getStatistics(): array;
    abstract protected function transformRow($item): array;

    public function collection()
    {
        return $this->data->map(fn($item) => $this->transformRow($item));
    }

    public function headings(): array
    {
        return array_keys($this->getColumns());
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => [
                    'fillType'   => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '4F81BD'],
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical'   => Alignment::VERTICAL_CENTER,
                ],
            ],
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet      = $event->sheet->getDelegate();
                $lastDataRow = $sheet->getHighestRow();
                $columns    = $this->getColumns();
                $lastColumn = $this->getColumnLetter(count($columns));

                $sheet->setAutoFilter("A1:{$lastColumn}1");

                foreach (range('A', $lastColumn) as $col) {
                    $sheet->getColumnDimension($col)->setAutoSize(true);
                }

                $separatorRow = $lastDataRow + 1;
                $sheet->mergeCells("A{$separatorRow}:{$lastColumn}{$separatorRow}");
                $sheet->setCellValue("A{$separatorRow}", 'STATISTICS');
                $sheet->getStyle("A{$separatorRow}:{$lastColumn}{$separatorRow}")->applyFromArray([
                    'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '4F81BD']],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical'   => Alignment::VERTICAL_CENTER,
                    ],
                ]);

                $this->addStatistics($sheet, $separatorRow + 1, $lastColumn, $lastDataRow);
            },
        ];
    }

    protected function addStatistics(Worksheet $sheet, int $startRow, string $lastColumn, int $lastDataRow): void
    {
        $statistics   = $this->getStatistics();
        $currentRow   = $startRow;
        $labelColumns = (int) ceil(count($this->getColumns()) / 2);
        $labelColumnLetter = $this->getColumnLetter($labelColumns);

        foreach ($statistics as $label => $config) {
            $sheet->mergeCells("A{$currentRow}:{$labelColumnLetter}{$currentRow}");
            $sheet->setCellValue("A{$currentRow}", $label);

            $valueStartCol = $this->getColumnLetter($labelColumns + 1);
            $sheet->mergeCells("{$valueStartCol}{$currentRow}:{$lastColumn}{$currentRow}");

            if (isset($config['formula'])) {
                $formula = str_replace('{lastRow}', $lastDataRow, $config['formula']);
                $sheet->setCellValue("{$valueStartCol}{$currentRow}", $formula);
            } elseif (isset($config['value'])) {
                $sheet->setCellValue("{$valueStartCol}{$currentRow}", $config['value']);
            }

            $sheet->getStyle("A{$currentRow}:{$lastColumn}{$currentRow}")->applyFromArray([
                'font' => ['bold' => true, 'color' => ['rgb' => 'FF0000']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FFFF00']],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical'   => Alignment::VERTICAL_CENTER,
                ],
            ]);

            $currentRow++;
        }
    }

    protected function getColumnLetter(int $number): string
    {
        return \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($number);
    }

    public function title(): string
    {
        return 'Detail';
    }
}
