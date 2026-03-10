@component('mail::message')
# {{ $typeIcon }} {{ $broadcast->title }}

<div style="border-left: 4px solid {{ $typeColor }}; padding-left: 16px; margin: 20px 0;">
    {!! nl2br(e($broadcast->content)) !!}
</div>

@if($broadcast->notes)
<div style="background-color: #f3f4f6; padding: 12px; border-radius: 6px; margin: 20px 0; font-size: 14px;">
    <strong>Additional Notes:</strong><br>
    {{ $broadcast->notes }}
</div>
@endif

<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
    <p>
        <strong>Broadcast Type:</strong> {{ ucfirst($broadcast->type) }}<br>
        <strong>Sent by:</strong> {{ $broadcast->createdBy->name }}<br>
        <strong>Sent at:</strong> {{ $broadcast->sent_at?->format('M d, Y H:i') }}
    </p>
</div>

@component('mail::button', ['url' => config('app.url')])
View in Dashboard
@endcomponent

Thanks,<br>
{{ config('app.name') }}
@endcomponent
