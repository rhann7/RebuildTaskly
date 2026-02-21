<?php

namespace App\Observers;
use App\Models\Timesheet\TimesheetEntry;

class TimesheetEntryObserver
{
    public function saved(TimesheetEntry $entry)
    {
        // Setiap kali entry disimpan/update, hitung ulang total jam di Header
        $entry->timesheet->calculateTotals();
    }

    public function deleted(TimesheetEntry $entry)
    {
        // Setiap kali entry dihapus, hitung ulang
        $entry->timesheet->calculateTotals();
    }
}
