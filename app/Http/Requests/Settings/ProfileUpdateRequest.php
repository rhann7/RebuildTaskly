<?php

namespace App\Http\Requests\Settings;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'company_name'        => ['required', 'string', 'max:255'],
            'company_email'       => [
                'required', 
                'email', 
                'max:255', 
                Rule::unique(User::class, 'email')->ignore($this->user()->id)
            ],
            'company_phone'       => ['nullable', 'string', 'max:20'],
            'company_address'     => ['nullable', 'string', 'max:500'],
            'company_category_id' => ['required', 'exists:company_categories,id'],
            'company_logo'        => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
        ];
    }
}