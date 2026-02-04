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
            'name'              => ['required', 'string', 'max:255', Rule::unique('permissions')->ignore($id)],
            'type'              => ['required', 'in:general,unique'],
            'scope'             => ['required', 'in:company,workspace'],
            'price'             => ['required', 'numeric', 'min:0'],
            'route_name'        => ['required', 'string'],
            'icon'              => ['nullable', 'string'],
            'isMenu'            => ['boolean'],
        ];
    }
}