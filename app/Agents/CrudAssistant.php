<?php

namespace App\Agents;

use App\Tools\AddDataTool;
use App\Tools\CompanyCategoryTool;
use Prism\Prism\Structured\PendingRequest as StructuredPendingRequest;
use Prism\Prism\Text\PendingRequest as TextPendingRequest;
use Vizra\VizraADK\Agents\BaseLlmAgent;
use Vizra\VizraADK\Contracts\ToolInterface;
use Vizra\VizraADK\System\AgentContext;
// use App\Tools\YourTool; // Example: Import your tool

class CrudAssistant extends BaseLlmAgent
{
    protected string $name = 'crud_assistant';
    protected string $description = 'Describe what this agent does.';

    /**
     * Agent instructions hierarchy (first found wins):
     * 1. Runtime: $agent->setPromptOverride('...')
     * 2. Database: agent_prompt_versions table (if enabled)
     * 3. File: resources/prompts/crud_assistant/default.blade.php
     * 4. Fallback: This property
     * 
     * The prompt file has been created for you at:
     * resources/prompts/crud_assistant/default.blade.php
     */
    protected string $instructions = 'You are crud Assistant. See resources/prompts/crud_assistant/default.blade.php for full instructions.';
    
    protected string $model = 'gemini-2.5-flash';

    protected array $tools = [
        CompanyCategoryTool::class
    ];

}
