<?php

namespace App\Http\Controllers\Timesheets;

use App\Http\Controllers\Controller;
use App\Models\ProjectManagement\Project;
use App\Models\TaskManagement\Task;
use App\Models\Timesheet\Timesheet;
use App\Models\Timesheet\TimesheetEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class TimesheetController extends Controller
{
    /**
     * Resolve company context based on user role.
     */
    private function resolveCompany($user)
    {
        if ($user->isSuperAdmin()) return null;
        $company = $user->company ?? $user->companyOwner?->company;
        abort_if(!$company, 403, 'Unauthorized: No company association found.');
        return $company;
    }

    /**
     * Helper to get clean project list with tasks for dropdowns.
     */
    private function getProjectsForRegistry($user, $company)
    {
        return Project::query()
            ->whereHas('workspace', function ($q) use ($company, $user) {
                if ($company) $q->where('company_id', $company->id);
            })
            ->where(function ($q) use ($user) {
                $q->whereHas('users', fn($sq) => $sq->where('user_id', $user->id))
                    ->orWhereHas('workspace', fn($sq) => $sq->where('manager_id', $user->id));
            })
            ->where('status', 'active')
            ->with([
                'workspace:id,slug',
                'tasks' => function ($query) {
                    $query->select('id', 'project_id', 'title', 'slug')
                        // PERBAIKAN DI SINI:
                        ->with(['subtasks' => function ($q) {
                            $q->select('id', 'task_id', 'title', 'is_completed', 'completed_by', 'created_at')
                                ->with('completer:id,name'); // Load nama yang mencentang
                        }]);
                }
            ])
            ->get(['id', 'name', 'slug', 'workspace_id']);
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $company = $this->resolveCompany($user);

        // 1. Time Context
        $dateParam = $request->input('date', now()->toDateString());
        $currentDate = Carbon::parse($dateParam);
        $startOfWeek = $currentDate->copy()->startOfWeek();

        // 2. Fetch Data
        $projects = $this->getProjectsForRegistry($user, $company);

        $currentTimesheet = Timesheet::where('user_id', $user->id)
            ->where('start_at', $startOfWeek->toDateString())
            ->with(['entries.task', 'entries.subTask', 'entries.project'])
            ->first();

        // 3. Stats Calculation
        $stats = [
            'totalHoursWeek' => 0,
            'approvedHours'  => 0,
            'pendingHours'   => 0,
            'draftHours'     => 0,
        ];

        if ($currentTimesheet) {
            $entries = $currentTimesheet->entries;
            $stats['totalHoursWeek'] = round($entries->sum('duration_minutes') / 60, 2);
            $stats['approvedHours']  = round($entries->where('status', 'approved')->sum('duration_minutes') / 60, 2);
            $stats['pendingHours']   = round($entries->where('status', 'submitted')->sum('duration_minutes') / 60, 2);
            $stats['draftHours']     = round($entries->where('status', 'draft')->sum('duration_minutes') / 60, 2);
        }
        //  
        $mappedEntries = [];
        if ($currentTimesheet) {
            $mappedEntries = $currentTimesheet->entries->map(function ($entry) {
                return [
                    'id'          => $entry->id,
                    'taskName'    => $entry->task?->title ?? $entry->description,
                    'date'        => $entry->date,
                    'startTime'   => \Carbon\Carbon::parse($entry->start_at)->format('H:i'),
                    'endTime'     => \Carbon\Carbon::parse($entry->end_at)->format('H:i'),
                    'status'      => $entry->status ?? 'draft',

                    // --- WAJIB TAMBAHKAN INI AGAR BISA DI-EDIT ---
                    'project_id'  => $entry->project_id,
                    'task_id'     => $entry->task_id,
                    'sub_task_id' => $entry->sub_task_id,
                    'description' => $entry->description,
                ];
            });
        }
        //
        $pendingLogs = [];
        if ($user->hasAnyRole(['company', 'manager', 'super-admin'])) {
            // Ambil timesheet yang statusnya 'submitted' dari user yang perusahaannya sama
            $pendingLogs = Timesheet::where('status', 'submitted')
                ->whereHas('user', function ($q) use ($company) {
                    if ($company) {
                        $q->where('company_id', $company->id);
                    }
                })
                ->with('user:id,name') // Ambil data karyawannya
                ->get();
        }
        //
        return Inertia::render('timesheets/index', [
            'projects'   => $projects,
            'timesheets' => [
                'current' => $currentTimesheet,
                'mapped'  => $mappedEntries,

                // --- UBAH BAGIAN HISTORY INI ---
                'history' => Timesheet::where('user_id', $user->id)
                    ->with(['entries.project', 'entries.task']) // <--- TAMBAHKAN BARIS INI
                    ->latest()
                    ->paginate(20)
            ],
            'stats'           => $stats,
            'currentDateProp' => $currentDate->toDateString(),
            'pageConfig'      => [
                'can_manage' => $user->hasAnyRole(['company', 'manager', 'super-admin'])
            ],
            'pendingLogs' => $pendingLogs,
        ]);
    }

    public function storeTask(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'title'      => 'required|string|max:255',
            'priority'   => 'required|in:low,medium,high',
        ]);

        // Simpan task baru ke project tersebut
        // Sesuaikan dengan logic Task management kamu, ini contoh umum:
        $project = Project::findOrFail($validated['project_id']);

        $task = $project->tasks()->create([
            'title' => $validated['title'],
            'priority' => $validated['priority'],
            'status' => 'backlog', // atau status default kamu
            'workspace_id' => $project->workspace_id,
        ]);

        return back()->with('success', 'Task created and linked.');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id'  => 'required|exists:projects,id',
            'task_id'     => 'nullable|exists:tasks,id',
            'sub_task_id' => 'nullable|exists:sub_tasks,id',
            'date'        => 'required|date',
            'start_time'  => 'required|date_format:H:i',
            'end_time'    => 'required|date_format:H:i|after:start_time', // Pastikan end_time setelah start_time
            'description' => 'required|string',
        ]);

        $user = $request->user();


        $hasOverlap = TimesheetEntry::where('user_id', $user->id)
            ->where('date', $validated['date'])
            ->where(function ($query) use ($validated) {
                // Logika Overlap: StartA < EndB DAN EndA > StartB
                $query->where('start_at', '<', $validated['end_time'])
                    ->where('end_at', '>', $validated['start_time']);
            })
            ->exists();
        if ($hasOverlap) {
            // Lemparkan error ke frontend Inertia (akan otomatis masuk ke props.errors.start_time)
            throw \Illuminate\Validation\ValidationException::withMessages([
                'start_time' => 'Waktu bertabrakan dengan tugas lain di hari ini.',
                'end_time'   => 'Cek kembali jam operasional Anda.'
            ]);
        }

        $project = Project::findOrFail($validated['project_id']);

        $date = \Carbon\Carbon::parse($validated['date']);
        $startOfWeek = $date->copy()->startOfWeek(\Carbon\Carbon::MONDAY);
        $endOfWeek = $date->copy()->endOfWeek(\Carbon\Carbon::SUNDAY);

        // 1. Create or Find the Parent Timesheet
        $timesheet = Timesheet::firstOrCreate(
            [
                'user_id'    => $user->id,
                'start_at'   => $startOfWeek->format('Y-m-d'),
                'end_at'     => $endOfWeek->format('Y-m-d'),
            ],
            [
                'workspace_id' => $project->workspace_id,
                'status'       => 'draft',
                'total_hours'  => 0,
            ]
        );

        $start = \Carbon\Carbon::parse($validated['start_time']);
        $end = \Carbon\Carbon::parse($validated['end_time']);

        // Ensure hours are calculated correctly (End minus Start)
        $hours = $start->diffInMinutes($end) / 60;

        // 2. Create the Timesheet Entry (Adding user_id here!)
        $timesheet->entries()->create([
            'user_id'     => $user->id, // <--- ADDED THIS LINE
            'project_id'  => $validated['project_id'],
            'task_id'     => $validated['task_id'],
            'sub_task_id' => $validated['sub_task_id'],
            'date'        => $validated['date'],
            'start_at'    => $validated['start_time'],
            'end_at'      => $validated['end_time'],
            'hours'       => round($hours, 2),
            'description' => $validated['description'],
        ]);

        // 3. Update the total hours
        $timesheet->calculateTotals();

        return back()->with('success', 'Time entry logged successfully.');
    }

    public function update(Request $request, $id)
    {
        // 1. Validate the incoming data
        $validated = $request->validate([
            'project_id'  => 'required|exists:projects,id',
            'task_id'     => 'nullable|exists:tasks,id',
            'sub_task_id' => 'nullable|exists:sub_tasks,id',
            'date'        => 'required|date',
            'start_time'  => 'required|date_format:H:i',
            'end_time'    => 'required|date_format:H:i',
            'description' => 'required|string',
        ]);

        // 2. Find the entry by ID
        $entry = TimesheetEntry::findOrFail($id);

        // 3. Calculate total hours for this specific entry
        $start = \Carbon\Carbon::parse($validated['start_time']);
        $end = \Carbon\Carbon::parse($validated['end_time']);

        // Ensure start time is before end time for calculation
        $hours = $start->diffInMinutes($end) / 60;

        // 4. Update the database record
        $entry->update([
            'project_id'  => $validated['project_id'],
            'task_id'     => $validated['task_id'],
            'sub_task_id' => $validated['sub_task_id'],
            'date'        => $validated['date'],
            'start_at'    => $validated['start_time'],
            'end_at'      => $validated['end_time'],
            'hours'       => round($hours, 2),
            'description' => $validated['description'],
        ]);

        // 5. Recalculate total hours for the parent Timesheet
        if ($entry->timesheet) {
            $entry->timesheet->calculateTotals();
        }

        // 6. Return response
        return back()->with('success', 'Time entry updated successfully.');
    }

    public function updateTime(Request $request, $id)
    {
        $validated = $request->validate([
            'start_time' => 'required|date_format:H:i',
            'end_time'   => 'required|date_format:H:i',
        ]);

        $entry = TimesheetEntry::findOrFail($id);

        $start = \Carbon\Carbon::parse($validated['start_time']);
        $end = \Carbon\Carbon::parse($validated['end_time']);

        // PERBAIKAN PENTING: $start duluan, baru $end agar hasilnya POSITIF
        $hours = $start->diffInMinutes($end) / 60;

        $entry->update([
            'start_at' => $validated['start_time'],
            'end_at'   => $validated['end_time'],
            'hours'    => round($hours, 2),
        ]);

        if ($entry->timesheet) {
            $entry->timesheet->calculateTotals();
        }

        return back()->with('success', 'Operational time modified successfully.');
    }
    public function destroy($id)
    {
        $entry = TimesheetEntry::findOrFail($id);
        $timesheet = $entry->timesheet;

        $entry->delete();

        // Kalkulasi ulang total jam di header setelah detail dihapus
        if ($timesheet) {
            $timesheet->calculateTotals();
        }

        return back()->with('success', 'Time entry deleted successfully.');
    }

    public function submit(Request $request, Timesheet $timesheet)
    {
        // Pastikan yang submit adalah pemilik timesheet-nya
        abort_if($timesheet->user_id !== $request->user()->id, 403, 'Akses ditolak.');

        // Gunakan DB query langsung untuk menghindari Model Events yang mungkin tersembunyi
        DB::table('timesheets')
            ->where('id', $timesheet->id)
            ->update([
                'status' => 'submitted',
                'updated_at' => now(),
            ]);

        return back()->with('success', 'Timesheet berhasil dikirim untuk di-review Manager.');
    }

    public function approve(Request $request, Timesheet $timesheet)
    {
        // $this->authorizeProject($request->user(), $timesheet->workspace->project); 

        \DB::transaction(function () use ($request, $timesheet) {
            // 1. HANYA update status timesheet (header-nya saja)
            $timesheet->update(['status' => 'approved']);

            // HAPUS BARIS INI: $timesheet->entries()->update(['status' => 'approved']);

            // 2. Catat di tabel Approval
            $timesheet->approvals()->create([
                'approver_id' => $request->user()->id,
                'status'      => 'approved',
                'comments'    => 'Approved via Manager Review',
            ]);
        });

        return back()->with('success', 'Timesheet Authorized.');
    }

    public function reject(Request $request, Timesheet $timesheet)
    {
        $request->validate(['reason' => 'required|string']);

        \DB::transaction(function () use ($request, $timesheet) {
            // 1. HANYA update status timesheet
            $timesheet->update(['status' => 'revision']);

            // HAPUS BARIS INI: $timesheet->entries()->update(['status' => 'revision']);

            // 2. Catat alasan penolakan di tabel Approval
            $timesheet->approvals()->create([
                'approver_id' => $request->user()->id,
                'status'      => 'rejected',
                'comments'    => $request->reason,
            ]);
        });

        return back()->with('success', 'Timesheet sent back for revision.');
    }

    public function rejectEntry(Request $request, $id)
    {
        $request->validate(['reason' => 'required|string']);

        $entry = TimesheetEntry::findOrFail($id);

        \DB::transaction(function () use ($request, $entry) {
            // 1. Ubah status entry menjadi revision & simpan alasannya
            $entry->update([
                'status'        => 'revision',
                'reject_reason' => $request->reason,
            ]);

            // 2. Otomatis ubah status induk Timesheet-nya jadi 'revision' juga 
            //    biar karyawan tau ada yang harus diperbaiki
            if ($entry->timesheet && $entry->timesheet->status !== 'revision') {
                $entry->timesheet->update(['status' => 'revision']);
            }
        });

        return back()->with('success', 'Entry flagged for revision.');
    }
}
