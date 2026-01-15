<?php

namespace App\Tools;

use App\Http\Controllers\Companies\CategoryController;
use App\Models\CompanyCategory;
use Vizra\VizraADK\Contracts\ToolInterface;
use Vizra\VizraADK\Memory\AgentMemory;
use Vizra\VizraADK\System\AgentContext;

class CompanyCategoryTool implements ToolInterface
{
    private $companyCategoryController;

    private function __construct(
        CategoryController $CompanyCategoryController
    )
    {
        $this->companyCategoryController = $CompanyCategoryController;
    }

    /**
     * Get the tool's definition for the LLM.
     * This structure should be JSON schema compatible.
     */
    public function definition(): array
    {
        return [
            'name' => 'company_category',
            'description' => 'Company Category.',
            'parameters' => [
                'type' => 'object',
                'properties' => [
                    // Define your parameters here
                    'name' => [
                        'type' => 'string',
                        'description' => ''
                    ],
                    'company_category_id' => [
                        'type' => 'integer',
                        'description' => ''
                    ],
                    'action' => [
                        'type' => 'string',
                        'description' => '',
                        'enum' => ['add_category_company', 'update_category_company', 'delete_category_company']
                    ]
                ],
                'required' => ['name'],
            ],
        ];
    }

    /**
     * Execute the tool's logic.
     *
     * @param array $arguments Arguments provided by the LLM, matching the parameters defined above.
     * @param AgentContext $context The current agent context, providing access to session state etc.
     * @return string JSON string representation of the tool's result.
     */
    public function execute(array $arguments, AgentContext $context, AgentMemory $memory): string
    {
        switch($arguments['action']){
            case 'add_category_company': 
                try{
                    $category = $this->companyCategoryController->store($arguments['name']);
                }catch(\Exception $e) {
                    throw new $e;
                }
                
                return json_encode($category);
            case 'update_category_company':
                try{
                    $category = $this->companyCategoryController->update();
                }catch(\Exception $e){
                    throw new $e;
                }

                return json_encode($category);
            case 'delete_category_company':
                try{
                    $category = $this->companyCategoryController->delete();
                }catch(\Exception $e) {
                    throw new $e;
                }

                return json_encode($category);
        }
    }
}
