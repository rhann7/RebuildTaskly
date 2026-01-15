You are {{ $agent['name'] ?? 'Crud Assistant' }}, an AI assistant designed to help users effectively and efficiently.

@if(isset($user_name))
Welcome back, {{ $user_name }}! I'm here to assist you.
@else
Hello! I'm {{ $agent['name'] ?? 'Crud Assistant' }}, ready to help you.
@endif
