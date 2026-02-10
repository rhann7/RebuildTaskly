<?php

namespace App\Http\Controllers\TaskManagement\Tasks;

use App\Http\Controllers\Controller;
use App\Models\ProjectManagement\Project;
use App\Models\TaskManagement;
use App\Models\TaskManagement\Task;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Str;

class TaskController extends Controller
{
    private function resolveCompany($user)
    {
        if ($user->isSuperAdmin()) return null;

        $company = $user->company ?? $user->companyOwner?->company;
        abort_if(!$company, 403, 'Anda tidak terikat dengan perusahaan manapun.');

        return $company;
    }

    private function authorizeProject($user, Project $project)
    {
        if ($user->isSuperAdmin()) return;

        $company = $this->resolveCompany($user);

        abort_if(
            !$project->workspace ||
                $project->workspace->company_id !== $company->id,
            403,
            'Akses ditolak. Project tidak terikat dengan perusahaan Anda.'
        );
    }

    public function index(Request $request, Workspace $workspace, Project $project,)
    {
        $user = $request->user();

        abort_if($project->workspace_id !== $workspace->id, 404);
        $this->authorizeProject($user, $project);

        $tasks = Task::query()
            ->where('project_id', $project->id)
            ->when($request->search, fn($q, $s) => $q->where('title', 'like', "%{$s}%"))
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('tasks/index', [
            'workspace' => $workspace,
            'project' => $project,
            'tasks' => $tasks,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function store(Request $request, Workspace $workspace, Project $project)
    {
        abort_if($project->workspace_id !== $workspace->id, 404);
        $this->authorizeProject($request->user(), $project);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:todo,in_progress,done',
            'priority' => 'required|in:low,medium,high',
            'due_date' => 'nullable|date',
        ]);
        Task::create([
            'project_id'  => $project->id,
            'title'       => $validated['title'],
            'slug'        => Str::slug($validated['title']) . '-' . Str::lower(Str::random(5)),
            'description' => $validated['description'],
            'status'      => $validated['status'],
            'priority' => $validated['priority'],
            'due_date' => $validated['due_date'],
        ]);


        return back()->with('success', 'Task created successfully.');
    }


  public function show(Request $request, Workspace $workspace, Project $project, Task $task)
    {
        // 1. Validasi Hirarki: Pastikan rute tidak 'nyasar'
        abort_if($task->project_id !== $project->id || $project->workspace_id !== $workspace->id, 404);

        // 2. Eager Load: Ambil sub-task dan user yang menyelesaikannya
        $task->load([
            'subtasks' => function ($query) {
                $query->with('completer')->latest(); // 'completer' adalah relasi ke completed_by
            }
        ]);

        // 3. Render: Pastikan render ke 'tasks/show' atau folder detail task, BUKAN project detail
        return Inertia::render('tasks/show', [
            'workspace' => $workspace,
            'project'   => $project,
            'task'      => $task,
            'subtasks'  => $task->subtasks,
            // Cek apakah user adalah manager workspace atau super-admin
            'isManager' => $request->user()->id === $workspace->manager_id || $request->user()->isSuperAdmin(),
        ]);
    }

    public function update(Request $request, Workspace $workspace, Project $project, Task $task)
    {
        abort_if($project->workspace_id !== $workspace->id, 404);
        abort_if($task->project_id !== $project->id, 404);

        $this->authorizeProject($request->user(), $project);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:todo,in_progress,done',
        ]);

        $task->update($validated);

        return back()->with('success', 'Task updated successfully.');
    }

    public function destroy(Request $request, Workspace $workspace, Project $project, Task $task)
    {
        abort_if($project->workspace_id !== $workspace->id, 404);
        abort_if($task->project_id !== $project->id, 404);

        $this->authorizeProject($request->user(), $project);

        $task->delete();

        return back()->with('success', 'Task deleted successfully.');
    }
}
