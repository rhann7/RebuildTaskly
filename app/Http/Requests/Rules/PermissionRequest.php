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
        $permission = $this->route('permission');
        $id = $permission instanceof \Spatie\Permission\Models\Permission ? $permission->id : $permission;

        return [
            'name'              => ['required', 'string', 'max:255', Rule::unique('permissions')->ignore($id)],
            'module_id'         => ['required', 'exists:modules,id'],
            'type'              => ['required', 'in:general,unique'],
            'scope'             => ['required', 'in:company,workspace'],
            'price'             => ['required', 'numeric', 'min:0'],
            'route_name'        => ['required', 'string'],
            'route_path'        => ['required', 'string'],
            'controller_action' => ['required', 'string'],
            'icon'              => ['nullable', 'string'],
            'isMenu'            => ['boolean'],
        ];
    }
}