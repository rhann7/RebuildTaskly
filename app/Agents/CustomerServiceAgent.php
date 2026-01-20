<?php

namespace App\Agents;

use Prism\Prism\Structured\PendingRequest as StructuredPendingRequest;
use Prism\Prism\Text\PendingRequest as TextPendingRequest;
use Vizra\VizraADK\Agents\BaseLlmAgent;
use Vizra\VizraADK\Contracts\ToolInterface;
use Vizra\VizraADK\System\AgentContext;
// use App\Tools\YourTool; // Example: Import your tool

class CustomerServiceAgent extends BaseLlmAgent
{
    protected string $name = 'customer_service_agent';
    protected string $description = 'Describe what this agent does.';
    protected string $model = 'gemini-2.5-flash';

    

    public function loadKnowledge(string $content): void
    {
        // Simple: just add content
        $this->vector()->addDocument($content);
    }

    public function answerQuestion(string $question, AgentContext $context): mixed
    {
        // Generate contextual answer using RAG
        $ragContext = $this->rag()->generateRagContext($question, [
            'namespace' => 'knowledge_base',
            'limit' => 5,
            'threshold' => 0.7
        ]);

        if ($ragContext['total_results'] > 0) {
            $contextualInput = "Based on this knowledge:\n" .
                $ragContext['context'] .
                "\n\nAnswer: " . $question;
        } else {
            $contextualInput = $question;
        }

        return parent::run($contextualInput, $context);
    }
}
