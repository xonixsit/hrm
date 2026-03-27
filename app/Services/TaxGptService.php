<?php

namespace App\Services;

use App\Models\ChatSession;
use App\Models\ChatMessage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TaxGptService
{
    private string $apiKey;
    private string $model = 'llama-3.3-70b-versatile';
    private string $apiUrl = 'https://api.groq.com/openai/v1/chat/completions';

    private string $systemPrompt = <<<PROMPT
You are TaxGPT, an expert AI assistant specialized in Indian and international taxation, GST, income tax, TDS, tax planning, and financial compliance. You assist sales tele-executives who are on calls with customers and need quick, accurate tax information.

Guidelines:
- Provide clear, concise, and accurate tax information
- Use simple language suitable for explaining to customers over the phone
- Include relevant sections, rules, or notifications when applicable
- If a question is outside tax/finance scope, politely redirect to tax topics
- Format responses for easy reading during a live call (use bullet points, short paragraphs)
PROMPT;

    public function __construct()
    {
        // DB setting takes priority over .env
        $this->apiKey = \App\Models\Setting::get('system_settings.groq_api_key')
            ?: config('services.groq.api_key', '');
    }

    public function chat(ChatSession $session, string $userMessage): string
    {
        // Save user message
        $session->messages()->create(['role' => 'user', 'content' => $userMessage]);

        // Auto-title session from first message
        if ($session->messages()->count() === 1) {
            $title = strlen($userMessage) > 50 ? substr($userMessage, 0, 50) . '...' : $userMessage;
            $session->update(['title' => $title]);
        }

        $messages = $this->buildMessages($session);

        $response = Http::withToken($this->apiKey)
            ->timeout(30)
            ->post($this->apiUrl, [
                'model' => $this->model,
                'messages' => $messages,
                'max_tokens' => 1024,
                'temperature' => 0.3,
            ]);

        if (!$response->successful()) {
            Log::error('Groq API error', ['status' => $response->status(), 'body' => $response->body()]);
            throw new \Exception('Failed to get response from TaxGPT. Please try again.');
        }

        $assistantMessage = $response->json('choices.0.message.content', '');

        // Save assistant response
        $session->messages()->create(['role' => 'assistant', 'content' => $assistantMessage]);

        return $assistantMessage;
    }

    public function stream(ChatSession $session, string $userMessage, callable $onChunk): string
    {
        // Save user message
        $session->messages()->create(['role' => 'user', 'content' => $userMessage]);

        // Auto-title session from first message
        if ($session->messages()->count() === 1) {
            $title = strlen($userMessage) > 50 ? substr($userMessage, 0, 50) . '...' : $userMessage;
            $session->update(['title' => $title]);
        }

        $messages = $this->buildMessages($session);

        $fullContent = '';

        $response = Http::withToken($this->apiKey)
            ->timeout(60)
            ->withOptions(['stream' => true])
            ->post($this->apiUrl, [
                'model' => $this->model,
                'messages' => $messages,
                'max_tokens' => 1024,
                'temperature' => 0.3,
                'stream' => true,
            ]);

        if (!$response->successful()) {
            Log::error('Groq API stream error', ['status' => $response->status(), 'body' => $response->body()]);
            throw new \Exception('Failed to get response from TaxGPT. Please try again.');
        }

        $body = $response->toPsrResponse()->getBody();

        $buffer = '';
        while (!$body->eof()) {
            $chunk = $body->read(512);
            $buffer .= $chunk;

            // Process complete SSE lines
            while (($pos = strpos($buffer, "\n")) !== false) {
                $line = substr($buffer, 0, $pos);
                $buffer = substr($buffer, $pos + 1);
                $line = trim($line);

                if (!str_starts_with($line, 'data: ')) continue;
                $data = substr($line, 6);
                if ($data === '[DONE]') break 2;

                $parsed = json_decode($data, true);
                $token = $parsed['choices'][0]['delta']['content'] ?? '';
                if ($token !== '') {
                    $fullContent .= $token;
                    $onChunk($token);
                }
            }
        }

        // Save complete assistant response
        $session->messages()->create(['role' => 'assistant', 'content' => $fullContent]);

        return $fullContent;
    }

    private function buildMessages(ChatSession $session): array
    {
        $history = $session->messages()
            ->orderBy('created_at')
            ->get()
            ->map(fn($m) => ['role' => $m->role, 'content' => $m->content])
            ->toArray();

        return array_merge(
            [['role' => 'system', 'content' => $this->systemPrompt]],
            $history
        );
    }
}
