<?php

namespace App\Agents;

use App\Tools\LoadPdfToVectorTool;
use App\Tools\PdfReaderTool;
use App\Tools\SearchPdfTool;
use Prism\Prism\Structured\PendingRequest as StructuredPendingRequest;
use Prism\Prism\Text\PendingRequest as TextPendingRequest;
use Vizra\VizraADK\Agents\BaseLlmAgent;
use Vizra\VizraADK\Contracts\ToolInterface;
use Vizra\VizraADK\System\AgentContext;
// use App\Tools\YourTool; // Example: Import your tool

class PdfAssistant extends BaseLlmAgent
{
    protected string $name = 'pdf_assistant';
    protected string $description = 'AI Assistant untuk membaca dan menganalisis dokumen PDF';
    protected string $instructions = "Anda adalah asisten AI yang ahli dalam membaca dan menganalisis dokumen PDF.
    
    Kemampuan Anda:
    1. Membaca file PDF dari folder storage/app/pdfs/
    2. Mengekstrak dan memahami konten PDF
    3. Menjawab pertanyaan tentang isi PDF
    4. Memuat PDF ke vector memory untuk pencarian semantik
    5. Menganalisis dan merangkum dokumen
    
    Gunakan tool read_pdf untuk membaca PDF langsung.
    Gunakan tool load_pdf_to_memory untuk memuat PDF ke vector memory, lalu gunakan RAG untuk menjawab pertanyaan.
    
    Selalu ramah, jelas, dan berikan jawaban yang akurat berdasarkan isi dokumen.";

    protected string $model = 'gemini-2.5-flash';
    protected ?float $temperature = 0.3;

    protected array $tools = [
        PdfReaderTool::class,
        LoadPdfToVectorTool::class,
        SearchPdfTool::class,
    ];
}
