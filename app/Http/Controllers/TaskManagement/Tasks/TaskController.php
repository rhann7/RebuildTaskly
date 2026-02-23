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

    public function index(Request $request, Workspace $workspace, Project $project)
    {
        $user = $request->user();
        abort_if($project->workspace_id !== $workspace->id, 404);
        $this->authorizeProject($user, $project);

        $tasks = Task::query()
            ->where('project_id', $project->id)
            ->with(['subtasks.completer']) // Pastiin ini ada di sini
            ->when($request->search, fn($q, $s) => $q->where('title', 'like', "%{$s}%"))
            ->when($request->priority, fn($q, $p) => $q->where('priority', $p))
            ->latest()
            ->paginate(10)
            ->withQueryString()
            // PAKE THROUGH: Ini cara paling aman buat manipulasi data Paginate Laravel
            ->through(function ($task) {
                $total = $task->subtasks->count();
                $completed = $task->subtasks->filter(fn($s) => $s->is_completed == 1 || $s->is_completed == true)->count();
                
                // Masukin data ke object task-nya langsung
                $task->manual_progress = $total > 0 ? round(($completed / $total) * 100) : null;
                $task->total_objectives = $total;
                
                // PAKSA subtasks ikut ke-render di JSON
                $task->setRelation('subtasks', $task->subtasks); 
                
                return $task;
            });

        // Itungan Header Project
        $project->tasks_count = Task::where('project_id', $project->id)->count();
        $completedTasks = Task::where('project_id', $project->id)->where('status', 'done')->count();
        $project->progress = $project->tasks_count > 0 ? round(($completedTasks / $project->tasks_count) * 100) : 0;
        
        return Inertia::render('tasks/index', [
            'workspace' => $workspace,
            'project' => $project,
            'tasks' => $tasks, // Sekarang $tasks udah mateng bawa manual_progress
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
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'required|in:todo,in_progress,done',
            'priority'    => 'required|in:low,medium,high', // <--- TAMBAH INI
            'due_date'    => 'nullable|date',               // <--- TAMBAH INI
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
        $user = $request->user();
        $company = $this->resolveCompany($user);

        $tasks = Task::query()
            // 1. Security Scope: Task harus milik project yang ada di workspace company user
            ->whereHas('project.workspace', function ($q) use ($company, $user) {
                if (!$user->isSuperAdmin()) {
                    $q->where('company_id', $company->id);
                }
            })
            // 2. Load Relations buat context di tabel
            ->with(['project:id,name,slug,workspace_id', 'project.workspace:id,name', 'assignee:id,name'])
            
            // 3. Filters
            ->when($request->search, fn($q, $s) => $q->where('title', 'like', "%{$s}%"))
            ->when($request->status, fn($q, $st) => $q->whereIn('status', (array)$st))
            ->when($request->priority, fn($q, $p) => $q->whereIn('priority', (array)$p))
            ->when($request->projects, fn($q, $pr) => $q->whereIn('project_id', (array)$pr))
            
            ->latest()
            ->paginate(15)
            ->withQueryString();

        // Ambil daftar project buat dropdown "Add Task" & Filter
        $projects = Project::query()
            ->whereHas('workspace', function ($q) use ($company, $user) {
                if (!$user->isSuperAdmin()) {
                    $q->where('company_id', $company->id);
                }
            })
            ->get(['id', 'name']);

        return Inertia::render('tasks/global-index', [
            'tasks'    => $tasks,
            'projects' => $projects,
            'filters'  => $request->only(['search', 'status', 'priority', 'projects']),
        ]);
    }

    public function quickStore(Request $request)
    {
        $request->validate([
            'project_id' => 'required|exists:projects,id',
            'title'      => 'required|string|max:255',
            'priority'   => 'required|in:low,medium,high',
        ]);

        $project = Project::with('workspace')->findOrFail($request->project_id);

        // Cek apakah user boleh nambah task di project ini
        // Pakai logic authorizeProject lo yang udah ada
        $this->authorizeProject($request->user(), $project);

        $task = $project->tasks()->create([
            'title'    => $request->title,
            'priority' => $request->priority,
            'status'   => 'todo', // Default status
            'slug'     => \Str::slug($request->title) . '-' . \Str::random(5),
        ]);

        return back()->with('success', 'Task deployed to ' . $project->name);
    }
}
