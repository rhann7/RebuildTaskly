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
            'name'                     => ['required', 'string', 'max:255'],
            'description'              => ['nullable', 'string'],
            'price_monthly'            => ['required_if:is_free,false', 'nullable', 'numeric', 'min:0'],
            'discount_monthly_percent' => ['nullable', 'integer', 'min:0', 'max:100'],
            'price_yearly'             => ['required_if:is_yearly,true', 'nullable', 'numeric', 'min:0'],
            'discount_yearly_percent'  => ['nullable', 'integer', 'min:0', 'max:100'],
            'is_free'                  => ['boolean'],
            'is_yearly'                => ['boolean'],
            'is_active'                => ['boolean'],
            'module_ids'               => ['nullable', 'array'],
            'module_ids.*'             => ['integer', Rule::exists('modules', 'id')->where('is_active', true)],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if (!$this->is_free && !$this->price_monthly && !$this->is_yearly) {
                $validator->errors()->add('price_monthly', 'A paid plan must at least have a monthly price.');
            }

            if (!$this->is_yearly && $this->price_yearly > 0) {
                $validator->errors()->add('is_yearly', 'Please enable the yearly option if you want to set a yearly price.');
            }
        });
    }
}