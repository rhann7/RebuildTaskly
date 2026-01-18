<?php

namespace App\Tools;

use App\Http\Controllers\Companies\CategoryController;
use App\Models\CompanyCategory;
use Vizra\VizraADK\Contracts\ToolInterface;
use Vizra\VizraADK\Memory\AgentMemory;
use Vizra\VizraADK\System\AgentContext;

class CompanyCategoryTool implements ToolInterface
{
    protected CompanyCategory $model;

    public function __construct()
    {
        $this->model = new CompanyCategory();
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
                    'slug' => [
                        'type' => 'string',
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
     * Format success response
     */
    private function successResponse(string $message, array $data = null): string
    {
        $response = [
            'success' => true,
            'message' => $message,
        ];

        if ($data !== null) {
            $response['data'] = $data;
        }

        return json_encode($response);
    }

    /**
     * Format error response
     */
    private function errorResponse(string $message): string
    {
        return json_encode([
            'success' => false,
            'message' => $message,
        ]);
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
        try {
            // Validasi action ada
            if (!isset($arguments['action'])) {
                return $this->errorResponse('Parameter "action" is required.');
            }

            $action = $arguments['action'];

            // Route ke method yang sesuai
            return match ($action) {
                'add_category_company' => $this->addCategory($arguments),
                'update_category_company' => $this->updateCategory($arguments),
                'delete_category_company' => $this->deleteCategory($arguments),
                default => $this->errorResponse("Invalid action: {$action}")
            };
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    /**
     * Handle add category action
     */
    private function addCategory(array $arguments): string
    {
        // Validasi parameter
        if (!isset($arguments['name'])) {
            return $this->errorResponse('Parameter "name" is required for add action.');
        }

        try {
            // Panggil static method dari Model
            $category = CompanyCategory::store($arguments['name']);

            return $this->successResponse(
                "Category '{$category->name}' successfully created!",
                [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'created_at' => $category->created_at->toDateTimeString(),
                ]
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    /**
     * Handle update category action
     */
    private function updateCategory(array $arguments): string
    {
        // Validasi parameter
        if (!isset($arguments['name'])) {
            return $this->errorResponse('Parameter "name" is required for update action.');
        }

        if (!isset($arguments['slug'])) {
            return $this->errorResponse('Parameter "slug" is required for update action.');
        }

        try {
            // Panggil static method dari Model
            $category = CompanyCategory::updateCategory($arguments['name'], $arguments['slug']);

            return $this->successResponse(
                "Category '{$category->name}' successfully updated!",
                [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'updated_at' => $category->updated_at->toDateTimeString(),
                ]
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    /**
     * Handle delete category action
     */
    private function deleteCategory(array $arguments): string
    {
        // Validasi parameter
        if (!isset($arguments['slug'])) {
            return $this->errorResponse('Parameter "slug" is required for delete action.');
        }

        try {
            // Panggil static method dari Model
            $deleted = CompanyCategory::destroyCategory($arguments['slug']);

            if ($deleted) {
                return $this->successResponse("Category with slug '{$arguments['slug']}' successfully deleted!");
            }

            return $this->errorResponse('Failed to delete category.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }
}
