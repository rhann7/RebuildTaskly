<?php

namespace App\Http\Controllers\Chatbot;

use App\Services\OpenRouterService;
use Illuminate\Http\Request;

class ChatbotController {

    public function chat(Request $request, OpenRouterService $openRouter)
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        $messages = [
            [
                'role' => 'system',
                'content' => 'You are a helpful assistant.'
            ],
            [
                'role' => 'user',
                'content' => $request->message
            ],
        ];

        $result = $openRouter->chat($messages);

        return response()->json([
            'reply' => $result['choices'][0]['message']['content'] ?? '',
        ]);
    }

}