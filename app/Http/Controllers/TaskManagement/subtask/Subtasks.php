<?php

namespace App\Http\Controllers\TaskManagement\SubTasks;

use App\Http\Controllers\Controller;
use App\Models\TaskManagement\Task;
use App\Models\TaskManagement\SubTask;
use App\Models\ProjectManagement\Project;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubTaskController extends Controller
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

    /**
     * List SubTasks dari sebuah Task
     */
    // public function index(
    //     Request $request,
    //     Workspace $workspace,
    //     Project $project,
    //     Task $task
    // ) {
    //     abort_if($project->workspace_id !== $workspace->id, 404);
    //     abort_if($task->project_id !== $project->id, 404);

    //     $this->authorizeProject($request->user(), $project);

    //     $subTasks = $task->subTasks()
    //         ->latest()
    //         ->get();

    //     return Inertia::render('sub-tasks/index', [
    //         'workspace' => $workspace,
    //         'project'   => $project,
    //         'task'      => $task,
    //         'subTasks'  => $subTasks,
    //     ]);
    // }

    /**
     * Create SubTask
     */
    // public function store(
    //     Request $request,
    //     Workspace $workspace,
    //     Project $project,
    //     Task $task
    // ) {
    //     abort_if($project->workspace_id !== $workspace->id, 404);
    //     abort_if($task->project_id !== $project->id, 404);

    //     $this->authorizeProject($request->user(), $project);

    //     $validated = $request->validate([
    //         'title' => 'required|string|max:255',
    //     ]);

    //     $task->subTasks()->create([
    //         'title' => $validated['title'],
    //     ]);

    //     return back()->with('success', 'Sub-task berhasil ditambahkan.');
    // }

    /**
     * Update SubTask
     */
    public function update(
        Request $request,
        Workspace $workspace,
        Project $project,
        Task $task,
        SubTask $subTask
    ) {
        abort_if($project->workspace_id !== $workspace->id, 404);
        abort_if($task->project_id !== $project->id, 404);
        abort_if($subTask->task_id !== $task->id, 404);

        $this->authorizeProject($request->user(), $project);

        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'is_completed' => 'boolean',
        ]);

        $subTask->update($validated);

        return back()->with('success', 'Sub-task berhasil diperbarui.');
    }

    /**
     * Toggle Complete (opsional tapi kepake banget)
     */
    public function toggle(
        Request $request,
        Workspace $workspace,
        Project $project,
        Task $task,
        SubTask $subTask
    ) {
        abort_if($project->workspace_id !== $workspace->id, 404);
        abort_if($task->project_id !== $project->id, 404);
        abort_if($subTask->task_id !== $task->id, 404);

        $this->authorizeProject($request->user(), $project);

        $subTask->update([
            'is_completed' => !$subTask->is_completed,
            'completed_by' => !$subTask->is_completed
                ? $request->user()->id
                : null,
        ]);

        return back();
    }

    /**
     * Delete SubTask
     */
    public function destroy(
        Request $request,
        Workspace $workspace,
        Project $project,
        Task $task,
        SubTask $subTask
    ) {
        abort_if($project->workspace_id !== $workspace->id, 404);
        abort_if($task->project_id !== $project->id, 404);
        abort_if($subTask->task_id !== $task->id, 404);

        $this->authorizeProject($request->user(), $project);

        $subTask->delete();

        return back()->with('success', 'Sub-task berhasil dihapus.');
    }
}
