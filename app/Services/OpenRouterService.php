<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class OpenRouterService {

    public function chat(array $messages, array $options = [])
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . config('openrouter.api_key'),
            'Content-Type'  => 'application/json',
            'HTTP-Referer'  => config('app.url'), // wajib menurut OpenRouter
            'X-Title'       => config('app.name'),
        ])->post(config('openrouter.base_url') . '/chat/completions', [
            'model' => config('openrouter.model'),
            'messages' => $messages,
            'temperature' => $options['temperature'] ?? 0.7,
            'max_tokens'  => $options['max_tokens'] ?? 500,
        ]);

        if ($response->failed()) {
            throw new \Exception(
                $response->json('error.message') ?? 'OpenRouter API error'
            );
        }

        return $response->json();
    }

}