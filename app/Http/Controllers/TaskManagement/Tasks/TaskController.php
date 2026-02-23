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
            ->when($request->priority, fn($q, $p) => $q->where('priority', $p))
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
            // Validasi untuk array subtasks
            'subtasks' => 'nullable|array',
            'subtasks.*.title' => 'required|string|max:255',
        ]);

        // Gunakan Transaction untuk keamanan data
        \DB::transaction(function () use ($validated, $project) {
            // 1. Buat Task Utama
            $task = Task::create([
                'project_id'  => $project->id,
                'title'       => $validated['title'],
                'slug'        => Str::slug($validated['title']) . '-' . Str::lower(Str::random(5)),
                'description' => $validated['description'],
                'status'      => $validated['status'],
                'priority'    => $validated['priority'],
                'due_date'    => $validated['due_date'],
            ]);

            // 2. Jika ada subtasks, masukkan sekaligus
            if (!empty($validated['subtasks'])) {
                foreach ($validated['subtasks'] as $subtaskData) {
                    $task->subtasks()->create([
                        'title' => $subtaskData['title'],
                        'is_completed' => false,
                    ]);
                }
            }
        });

        return back()->with('success', 'Task and Sub-objectives deployed.');
    }


    public function show(Request $request, Workspace $workspace, Project $project, Task $task)
    {
        // 1. Pastikan hirarki bener
        abort_if($task->project_id !== $project->id || $project->workspace_id !== $workspace->id, 404);

        // 2. Load SEMUA relasi yang dibutuhin frontend dalam satu kali jalan
        $task->load([
            'project.workspace', // <--- INI KUNCINYA biar task.project.workspace.slug gak undefined
            'documents.user',    // Load documents sekalian biar muncul di list
            'subtasks' => function ($query) {
                $query->with('completer')->latest();
            }
        ]);

        // 3. Ambil user yang terdaftar di PROJECT ini
        $project->load('users');

        return Inertia::render('tasks/show', [
            'workspace' => $workspace,
            'project'   => $project,
            'task'      => $task,
            'isManager' => $request->user()->id === $workspace->manager_id
                || $request->user()->role === 'manager',
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

    public function updateStatus(Request $request, Workspace $workspace, Project $project, Task $task)
    {
        // 1. Validasi Hirarki
        abort_if($project->workspace_id !== $workspace->id, 404);
        abort_if($task->project_id !== $project->id, 404);
        $this->authorizeProject($request->user(), $project);

        // 2. Validasi input status yang diterima dari drag & drop
        $validated = $request->validate([
            'status' => 'required|in:todo,in_progress,done',
        ]);

        // 3. Update database
        $task->update([
            'status' => $validated['status']
        ]);

        // Karena frontend pakai preserveState, kita cukup return back() tanpa pesan sukses yang mengganggu UI
        return back();
    }

    public function destroy(Request $request, Workspace $workspace, Project $project, Task $task)
    {
        abort_if($project->workspace_id !== $workspace->id, 404);
        abort_if($task->project_id !== $project->id, 404);

        $this->authorizeProject($request->user(), $project);

        $task->delete();

        return back()->with('success', 'Task deleted successfully.');
    }

    // TaskController.php

    public function globalIndex(Request $request)
    {
        $tasks = Task::query()
            ->with(['project.workspace']) // INI KUNCINYA
            ->when($request->search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('tasks', [ // Ganti sesuai path file kamu
            'tasks' => $tasks,
            'filters' => $request->only(['search']),
        ]);
    }
}
