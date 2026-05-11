<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GameContentGeneratorService
{
    private string $apiKey;
    private string $model = 'llama-3.3-70b-versatile';
    private string $apiUrl = 'https://api.groq.com/openai/v1/chat/completions';

    public function __construct()
    {
        $this->apiKey = \App\Models\Setting::get('system_settings.groq_api_key')
            ?: config('services.groq.api_key', '');
    }

    /**
     * Generate objection-response pairs for Objection Crusher game
     */
    public function generateObjectionPairs(string $topic, string $difficulty, int $count = 10): array
    {
        $systemPrompt = <<<PROMPT
You are an expert sales trainer specializing in US tax consultation services. Generate realistic customer objections and professional, empathetic responses that sales representatives can use.

Your responses should be:
- Conversational and natural
- Empathetic and understanding
- Solution-focused
- Professional but friendly
- Specific to US tax amendment services

Return ONLY valid JSON, no additional text.
PROMPT;

        $userPrompt = <<<PROMPT
Generate {$count} customer objections and professional responses for US tax consultation services.

Topic: {$topic}
Difficulty: {$difficulty}

Format as JSON:
{
  "pairs": [
    {
      "objection": "customer objection text",
      "response": "professional response text",
      "category": "price|time|complexity|trust|value",
      "difficulty": "easy|medium|hard",
      "tips": "brief tip for handling this objection"
    }
  ]
}

Make objections realistic and responses actionable.
PROMPT;

        return $this->callGroqAPI($systemPrompt, $userPrompt);
    }

    /**
     * Generate trivia questions for Tax Trivia Tower game
     */
    public function generateTriviaQuestions(string $topic, string $difficulty, int $count = 15): array
    {
        $systemPrompt = <<<PROMPT
You are an expert in US taxation, specializing in creating educational content for tax professionals. Generate accurate, educational multiple-choice questions about US tax laws, regulations, and procedures.

Your questions should be:
- Factually accurate and up-to-date
- Clear and unambiguous
- Educational and informative
- Relevant to tax consultants and sales professionals
- Include helpful explanations

Return ONLY valid JSON, no additional text.
PROMPT;

        $userPrompt = <<<PROMPT
Generate {$count} multiple-choice trivia questions about US taxation.

Topic: {$topic}
Difficulty: {$difficulty}

Format as JSON:
{
  "questions": [
    {
      "question": "question text",
      "options": [
        {"text": "option A", "is_correct": false},
        {"text": "option B", "is_correct": true},
        {"text": "option C", "is_correct": false},
        {"text": "option D", "is_correct": false}
      ],
      "explanation": "detailed explanation of why the correct answer is right",
      "category": "{$topic}",
      "difficulty": "{$difficulty}",
      "source": "IRS publication or regulation reference if applicable"
    }
  ]
}

Ensure exactly one correct answer per question. Make questions educational and practical.
PROMPT;

        return $this->callGroqAPI($systemPrompt, $userPrompt);
    }

    /**
     * Generate additional objection responses for existing objection
     */
    public function generateAlternativeResponses(string $objection, int $count = 3): array
    {
        $systemPrompt = "You are a sales training expert. Generate alternative professional responses to customer objections. Return ONLY valid JSON.";

        $userPrompt = <<<PROMPT
Generate {$count} alternative professional responses to this customer objection:

Objection: "{$objection}"

Format as JSON:
{
  "responses": [
    {
      "response": "alternative response text",
      "approach": "empathy|logic|value|urgency",
      "tone": "friendly|professional|consultative"
    }
  ]
}
PROMPT;

        return $this->callGroqAPI($systemPrompt, $userPrompt);
    }

    /**
     * Improve/refine existing content
     */
    public function refineContent(string $type, string $content): array
    {
        $systemPrompt = "You are an expert editor specializing in sales and educational content. Improve the given content while maintaining its core message. Return ONLY valid JSON.";

        $userPrompt = <<<PROMPT
Improve this {$type} content:

"{$content}"

Format as JSON:
{
  "original": "{$content}",
  "improved": "improved version",
  "changes": ["list of improvements made"],
  "reasoning": "why these changes improve the content"
}
PROMPT;

        return $this->callGroqAPI($systemPrompt, $userPrompt);
    }

    /**
     * Call Groq API with error handling
     */
    private function callGroqAPI(string $systemPrompt, string $userPrompt): array
    {
        try {
            $response = Http::withToken($this->apiKey)
                ->timeout(60)
                ->post($this->apiUrl, [
                    'model' => $this->model,
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => $userPrompt]
                    ],
                    'max_tokens' => 4096,
                    'temperature' => 0.7,
                    'response_format' => ['type' => 'json_object']
                ]);

            if (!$response->successful()) {
                Log::error('Groq API error in GameContentGenerator', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                throw new \Exception('Failed to generate content. Please try again.');
            }

            $content = $response->json('choices.0.message.content', '');
            $decoded = json_decode($content, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('JSON decode error in GameContentGenerator', [
                    'content' => $content,
                    'error' => json_last_error_msg()
                ]);
                throw new \Exception('Failed to parse generated content.');
            }

            return $decoded;

        } catch (\Exception $e) {
            Log::error('Exception in GameContentGenerator', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }
}
