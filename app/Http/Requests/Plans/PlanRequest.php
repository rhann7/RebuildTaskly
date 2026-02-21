<?php

namespace App\Http\Requests\Plans;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'         => ['required', 'string', 'max:255'],
            'description'  => ['nullable', 'string'],
            'price'        => ['required', 'numeric', 'min:0'],
            'duration'     => ['required', 'integer', Rule::in([30, 365])],
            'is_active'    => ['boolean'],
            'module_ids'   => ['nullable', 'array'],
            'module_ids.*' => ['integer', Rule::exists('modules', 'id')->where('is_active', true)],
        ];
    }
}