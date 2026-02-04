<?php

namespace App\Http\Requests\Rules;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PermissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('permission')?->id;

        return [
            'module_id' => ['nullable', Rule::exists('modules', 'id')->where('is_active', true)],
            'name'       => ['required', 'string', 'max:255', Rule::unique('permissions')->ignore($id)],
            'route_name' => ['required', 'string'],
            'icon'       => ['nullable', 'string'],
            'isMenu'     => ['boolean'],
        ];
    }
}