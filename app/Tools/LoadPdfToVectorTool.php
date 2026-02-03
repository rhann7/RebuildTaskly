<?php

namespace App\Tools;

use Vizra\VizraADK\Contracts\ToolInterface;
use Vizra\VizraADK\Memory\AgentMemory;
use Vizra\VizraADK\System\AgentContext;
use Smalot\PdfParser\Parser;
use Illuminate\Support\Facades\File;

class LoadPdfToVectorTool implements ToolInterface
{
    /**
     * Get the tool's definition for the LLM.
     * This structure should be JSON schema compatible.
     */
    public function definition(): array
    {
        return [
            'name' => 'load_pdf_to_memory',
            'description' => 'Memuat isi PDF ke dalam vector memory untuk pencarian semantik. Gunakan ini sebelum menjawab pertanyaan detail tentang isi PDF.',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'filename' => [
                        'type' => 'string',
                        'description' => 'Nama file PDF untuk dimuat ke memory',
                    ],
                    'namespace' => [
                        'type' => 'string',
                        'description' => 'Namespace untuk organize dokumen (default: default)',
                        'default' => 'default',
                    ],
                ],
                'required' => ['filename'],
            ],
        ];
    }

    public function execute(array $arguments, AgentContext $context, AgentMemory $memory): string
    {
        try {
            $filename = $arguments['filename'];
            $namespace = $arguments['namespace'] ?? 'default';
            $pdfPath = storage_path('app/pdfs/' . $filename);

            if (!File::exists($pdfPath)) {
                return json_encode([
                    'status' => 'error',
                    'message' => "File {$filename} tidak ditemukan di folder storage/app/pdfs/",
                    'available_files' => $this->listAvailablePdfs(),
                ]);
            }

            // Parse PDF
            $parser = new Parser();
            $pdf = $parser->parseFile($pdfPath);
            $text = $pdf->getText();

            // Dapatkan agent dari context
            $agentClass = $context->getState('agent_class');
            if (!$agentClass) {
                return json_encode([
                    'status' => 'error',
                    'message' => 'Agent class tidak ditemukan di context',
                ]);
            }

            $agent = new $agentClass();

            // Load ke vector memory dengan chunking otomatis
            $agent->vector()->addDocument([
                'content' => $text,
                'metadata' => [
                    'source' => $filename,
                    'type' => 'pdf',
                    'loaded_at' => now()->toDateTimeString(),
                    'pages' => count($pdf->getPages()),
                ],
                'namespace' => $namespace,
                'source' => $filename,
            ]);

            $memory->addFact("PDF dimuat ke vector memory: {$filename}", 1.0);
            $memory->addLearning("PDF {$filename} tersedia untuk pencarian semantik");

            return json_encode([
                'status' => 'success',
                'message' => "PDF {$filename} berhasil dimuat ke vector memory",
                'filename' => $filename,
                'namespace' => $namespace,
                'pages' => count($pdf->getPages()),
                'info' => 'Sekarang Anda bisa menggunakan search_pdf_content untuk mencari informasi dalam dokumen ini',
            ]);
        } catch (\Exception $e) {
            return json_encode([
                'status' => 'error',
                'message' => 'Error: ' . $e->getMessage(),
            ]);
        }
    }

    private function listAvailablePdfs(): array
    {
        $pdfDir = storage_path('app/public/');
        if (!File::exists($pdfDir)) {
            return [];
        }

        $files = File::files($pdfDir);
        return array_map(fn($file) => $file->getFilename(), $files);
    }
}
