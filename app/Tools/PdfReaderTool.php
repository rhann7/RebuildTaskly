<?php

namespace App\Tools;

use Vizra\VizraADK\Contracts\ToolInterface;
use Vizra\VizraADK\Memory\AgentMemory;
use Vizra\VizraADK\System\AgentContext;
use Smalot\PdfParser\Parser;
use Illuminate\Support\Facades\File;

class PdfReaderTool implements ToolInterface
{
    /**
     * Get the tool's definition for the LLM.
     * This structure should be JSON schema compatible.
     */
    public function definition(): array
    {
        return [
            'name' => 'read_pdf',
            'description' => 'Membaca dan mengekstrak teks dari file PDF yang ada di folder project',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'filename' => [
                        'type' => 'string',
                        'description' => 'Nama file PDF yang akan dibaca (contoh: document.pdf)',
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

            // Path ke folder PDFs (sesuaikan dengan struktur project Anda)
            $pdfPath = storage_path('app/public/' . $filename);

            // Cek apakah file ada
            if (!File::exists($pdfPath)) {
                return json_encode([
                    'status' => 'error',
                    'message' => "File {$filename} tidak ditemukan di folder storage/app/public/",
                ]);
            }

            // Parse PDF
            $binPath = 'D:\Release-25.12.0-0\poppler-25.12.0\Library\bin\pdftotext.exe';
            $text = \Spatie\PdfToText\Pdf::getText($pdfPath, $binPath);

            // Simpan informasi ke memory
            $memory->addFact("PDF dibaca: {$filename}", 1.0);
            $memory->addLearning("User membaca PDF: {$filename}");

            return json_encode([
                'status' => 'success',
                'filename' => $filename,
                'content' => $text,
                'message' => 'PDF berhasil dibaca',
            ]);
        } catch (\Exception $e) {
            return json_encode([
                'status' => 'error',
                'message' => 'Error membaca PDF: ' . $e->getMessage(),
            ]);
        }
    }
}
