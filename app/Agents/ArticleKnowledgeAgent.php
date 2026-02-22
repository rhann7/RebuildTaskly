<?php

namespace App\Agents;

use App\Tools\ArticleSearchTool;
use Vizra\VizraADK\Agents\BaseLlmAgent;
use Vizra\VizraADK\System\AgentContext;

class ArticleKnowledgeAgent extends BaseLlmAgent
{
    protected string $name = 'article_knowledge_agent';

    protected string $description = 'Specialized AI agent for searching and providing information from the article knowledge base to help users solve their problems';

    /**
     * Agent instructions hierarchy (first found wins):
     * 1. Runtime: $agent->setPromptOverride('...')
     * 2. Database: agent_prompt_versions table (if enabled)
     * 3. File: resources/prompts/article_knowledge_agent/default.blade.php
     * 4. Fallback: This property
     * 
     * The prompt file should be created at:
     * resources/prompts/article_knowledge_agent/default.blade.php
     */
    protected string $instructions = 'You are Article Knowledge Agent. See resources/prompts/article_knowledge_agent/default.blade.php for full instructions.';

    // Model Configuration
    protected string $model = 'gemini-2.5-flash';
    protected ?float $temperature = 0.4; // Slightly higher for more natural responses
    protected ?float $topP = 0.8;
    protected ?int $maxTokens = 1000; // Allow longer responses for detailed explanations

    // History Chat Configuration
    protected bool $includeConversationHistory = true;
    protected string $contextStrategy = 'recent';
    protected int $historyLimit = 5; // Keep more history for better context

    // Tools
    protected array $tools = [
        ArticleSearchTool::class,
    ];

    /**
     * Custom variables to pass to the Blade view
     */
    protected function getPromptData(AgentContext $context): array
    {
        return [
            'company_name' => config('app.name'),
            'agent_name' => $this->name,
        ];
    }
}
