<?php

namespace App\Agents;

use App\Tools\SearchKnowlageTool;
use Prism\Prism\Structured\PendingRequest as StructuredPendingRequest;
use Prism\Prism\Text\PendingRequest as TextPendingRequest;
use Vizra\VizraADK\Agents\BaseLlmAgent;
use Vizra\VizraADK\Contracts\ToolInterface;
use Vizra\VizraADK\System\AgentContext;

class HelpDeskAgent extends BaseLlmAgent
{
    protected string $name = 'help_desk_agent';
    protected string $description = 'Handles customer inquiries and support requests';
    protected string $instructions = 'You are Help Desk Agent. See resources/prompts/help_desk_agent/default.blade.php for full instructions.';

    // Model Configuration
    protected string $model = 'gemini-2.5-flash';
    protected ?float $temperature = 0.3;
    protected ?float $topP = 0.8;
    protected ?int $maxTokens = 800;

    // History Chat Configuration
    protected bool $includeConversationHistory = true;
    protected string $contextStrategy = 'recent';
    protected int $historyLimit = 3;

    protected array $subAgents = [
        ArticleKnowledgeAgent::class,
        CrudAssistant::class,
    ];

    //Custom Throw Variable on Balde View
    protected function getPromptData(AgentContext $context): array
    {
        return [
            'company_name' => config('app.name'),
        ];
    }
}
