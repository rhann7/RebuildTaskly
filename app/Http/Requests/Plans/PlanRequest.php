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
            'name'          => ['required', 'string', 'max:255'],
            'description'   => ['nullable', 'string'],
            'price_monthly' => ['required', 'numeric', 'min:0'],
            'price_yearly'  => $this->is_basic ? ['prohibited'] : ['nullable', 'numeric', 'min:0'],
            'is_active'     => ['boolean'],
            'is_basic'      => ['boolean'],

            'module_ids'    => ['nullable', 'array'],
            'module_ids.*'  => ['integer', Rule::exists('modules', 'id')->where('is_active', true)],
        ];
    }
}