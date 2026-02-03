<?php

namespace App\Tools;

use Vizra\VizraADK\Contracts\ToolInterface;
use Vizra\VizraADK\Memory\AgentMemory;
use Vizra\VizraADK\System\AgentContext;

class SearchPdfTool implements ToolInterface
{
    /**
     * Get the tool's definition for the LLM.
     * This structure should be JSON schema compatible.
     */
    public function definition(): array
    {
        return [
            'name' => 'search_pdf_content',
            'description' => 'Mencari informasi relevan dalam PDF yang sudah dimuat ke vector memory menggunakan semantic search',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    'query' => [
                        'type' => 'string',
                        'description' => 'Pertanyaan atau topik yang ingin dicari dalam dokumen PDF',
                    ],
                    'limit' => [
                        'type' => 'integer',
                        'description' => 'Jumlah hasil maksimal (default: 5)',
                        'default' => 5,
                    ],
                ],
                'required' => ['query'],
            ],
        ];
    }

    public function execute(array $arguments, AgentContext $context, AgentMemory $memory): string
    {
        try {
            $query = $arguments['query'];
            $limit = $arguments['limit'] ?? 5;

            // Dapatkan agent class dari context
            $agentClass = $context->getState('agent_class');
            if (!$agentClass) {
                return json_encode([
                    'status' => 'error',
                    'message' => 'Agent class tidak ditemukan',
                ]);
            }

            $agent = new $agentClass();

            // Gunakan RAG untuk generate context
            $ragContext = $agent->rag()->generateRagContext($query, [
                'namespace' => 'default',
                'limit' => $limit,
                'threshold' => 0.7,
                'include_metadata' => true,
            ]);

            // Jika tidak ada hasil
            if ($ragContext['total_results'] === 0) {
                return json_encode([
                    'status' => 'warning',
                    'message' => 'Tidak ada konten relevan ditemukan. Pastikan PDF sudah di-load ke vector memory.',
                    'results' => [],
                ]);
            }

            // Simpan ke memory bahwa user melakukan search
            $memory->addLearning("User mencari: {$query}");

            return json_encode([
                'status' => 'success',
                'query' => $query,
                'total_results' => $ragContext['total_results'],
                'relevant_content' => $ragContext['context'],
                'message' => "Ditemukan {$ragContext['total_results']} bagian relevan dalam dokumen",
            ]);
        } catch (\Exception $e) {
            return json_encode([
                'status' => 'error',
                'message' => 'Error melakukan pencarian: ' . $e->getMessage(),
            ]);
        }
    }
}
