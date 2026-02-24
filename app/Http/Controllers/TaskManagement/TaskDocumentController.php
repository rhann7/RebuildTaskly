<?php

namespace App\Http\Controllers\TaskManagement;
use App\Http\Controllers\Controller;
use App\Models\TaskManagement\TaskDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\TaskManagement\Task;


class TaskDocumentController extends Controller
{
    public function store(Request $request, $workspace, $project, Task $task) // <--- Tambahin 'Task' di sini
    {
        $request->validate([
            'file' => 'required|file|max:10240',
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('documents', 'public');

            // Pake relasi documents() biar Laravel otomatis handle ID-nya
            $task->documents()->create([
                'user_id' => $request->user()->id,
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $path,
                'file_type' => $file->getClientOriginalExtension(),
                'file_size' => $this->formatBytes($file->getSize()),
            ]);

            return back()->with('success', 'Asset transmitted.');
        }
    }

    // Helper buat bikin size file jadi cantik (MB/KB)
    private function formatBytes($bytes, $precision = 2) {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, $precision) . ' ' . $units[$pow];
    }

    public function destroy(TaskDocument $document)
    {
        // 1. Hapus file fisik dari storage
        if (Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }

        // 2. Hapus data dari database
        $document->delete();

        return back()->with('success', 'Asset liquidated successfully.');
    }
}