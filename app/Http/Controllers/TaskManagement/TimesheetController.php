<?php

namespace App\Http\Controllers\TaskManagement;

use App\Http\Controllers\Controller;
use App\Models\Workspace;
use App\Models\ProjectManagement\Project;
use App\Models\TaskManagement\Task;
use App\Models\TaskManagement\Timesheet;
use Illuminate\Http\Request;

class TimesheetController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Ambil data timesheet milik user yang login
        $timesheets = Timesheet::where('user_id', $user->id)
            ->with(['task', 'subTask']) // Load relasi agar nama task muncul
            ->latest()
            ->paginate(10);

        return \Inertia\Inertia::render('timesheets/index', [
            'timesheets' => $timesheets,
        ]);
    }
    public function store(Request $request, Workspace $workspace, Project $project, Task $task)
    {
        $validated = $request->validate([
            'workspace_id' => 'required',
            'task_id' => 'required',
            'sub_task_id' => 'nullable',
            'note' => 'required|string|max:255',
            'start_at' => 'required|date',
            'end_at' => 'required|date|after:start_at',
        ]);

        $start = new \DateTime($validated['start_at']);
        $end = new \DateTime($validated['end_at']);
        $duration = ($end->getTimestamp() - $start->getTimestamp()) / 60;

        Timesheet::create(array_merge($validated, [
            'user_id' => $request->user()->id,
            'duration_minutes' => $duration
        ]));

        return back()->with('success', 'Timesheet logged.');
    }
}
