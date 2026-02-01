<?php

namespace App\Http\Requests\Modules;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ModuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    protected function prepareForValidation(): void
    {
        if (!$this->slug && $this->name) {
            $this->merge([
                'slug' => Str::slug($this->name)
            ]);
        }

        if (!$this->has('is_active')) $this->merge(['is_active' => true]);
    }

    public function rules(): array
    {
        $module = $this->route('module');
        $id = $module instanceof \App\Models\Module ? $module->id : $module;

        return [
            'name'        => ['required', 'string', 'max:255'],
            'slug'        => ['required', 'string', 'max:255', Rule::unique('modules')->ignore($id)],
            'type'        => ['required', 'in:standard,addon'],
            'description' => ['nullable', 'string'],
            'is_active'   => ['boolean'],
        ];
    }
}