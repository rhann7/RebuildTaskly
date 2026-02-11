<?php

namespace App\Http\Controllers\TaskManagement\SubTasks;

use App\Http\Controllers\Controller;
use App\Models\ProjectManagement\Project;
use App\Models\TaskManagement\SubTask;
use App\Models\TaskManagement\Task;
use App\Models\Workspace;
use Illuminate\Http\Request;

class SubTaskController extends Controller
{
    private function resolveCompany($user)
    {
        if ($user->isSuperAdmin()) return null;
        $company = $user->company ?? $user->companyOwner?->company;
        abort_if(!$company, 403, 'Otoritas perusahaan tidak ditemukan.');
        return $company;
    }

    private function authorizeProject($user, Project $project)
    {
        if ($user->isSuperAdmin()) return;
        $company = $this->resolveCompany($user);
        abort_if(
            !$project->workspace || $project->workspace->company_id !== $company->id,
            403,
            'Akses ditolak. Objek berada di luar yurisdiksi perusahaan Anda.'
        );
    }
    public function store(Request $request, Workspace $workspace, Project $project, Task $task)
    {
        // Validasi Hirarki
        abort_if($project->workspace_id !== $workspace->id || $task->project_id !== $project->id, 404);
        $this->authorizeProject($request->user(), $project);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $task->subTasks()->create($validated);

        return back()->with('success', 'Subtask deployed successfully.');
    }

    public function toggle(Request $request, Workspace $workspace, Project $project, Task $task, SubTask $subTask)
    {
        // Validasi Hirarki Lengkap
        abort_if(
            $project->workspace_id !== $workspace->id ||
                $task->project_id !== $project->id ||
                $subTask->task_id !== $task->id,
            404
        );

        $this->authorizeProject($request->user(), $project);

        $subTask->update([
            'is_completed' => !$subTask->is_completed,
            'completed_by' => !$subTask->is_completed ? $request->user()->id : null,
        ]);

        return back();
    }

    public function destroy(Request $request, Workspace $workspace, Project $project, Task $task, SubTask $subTask)
    {
        abort_if(
            $project->workspace_id !== $workspace->id ||
                $task->project_id !== $project->id ||
                $subTask->task_id !== $task->id,
            404
        );

        $this->authorizeProject($request->user(), $project);

        $subTask->delete();

        return back()->with('success', 'Subtask deleted successfully.');
    }
}
