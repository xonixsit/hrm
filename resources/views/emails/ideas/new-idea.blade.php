<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>New Idea Submitted</title>
<style>
    body { margin:0; padding:0; background:#f4f4f4; font-family: Arial, sans-serif; }
    .wrapper { max-width:600px; margin:32px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 16px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg,#006970,#00a9b4); padding:28px 32px; text-align:center; }
    .header h1 { color:#fff; margin:0; font-size:22px; font-weight:800; letter-spacing:-0.3px; }
    .header p  { color:rgba(255,255,255,0.8); margin:6px 0 0; font-size:13px; }
    .body { padding:28px 32px; }
    .meta-row { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:20px; }
    .badge {
        display:inline-block; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:700;
        text-transform:uppercase; letter-spacing:0.05em;
    }
    .badge-cat  { background:#e6f7f8; color:#006970; border:1px solid #b2e4e8; }
    .badge-new  { background:#fef3c7; color:#92400e; border:1px solid #fcd34d; }
    .section-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#9ca3af; margin-bottom:6px; }
    .idea-title { font-size:20px; font-weight:800; color:#111827; margin:0 0 16px; line-height:1.3; }
    .idea-body  { background:#f9fafb; border-left:4px solid #006970; border-radius:0 8px 8px 0; padding:16px 18px; color:#374151; font-size:14px; line-height:1.7; white-space:pre-wrap; }
    .submitter-row { margin-top:24px; padding:16px; background:#f0fdf9; border-radius:8px; border:1px solid #ccf0ec; }
    .submitter-row p { margin:0; font-size:13px; color:#065f46; }
    .submitter-row strong { color:#006970; }
    .cta { margin-top:28px; text-align:center; }
    .cta a {
        display:inline-block; padding:12px 28px; border-radius:8px;
        background:linear-gradient(135deg,#006970,#00a9b4); color:#fff;
        font-size:14px; font-weight:700; text-decoration:none;
    }
    .footer { padding:20px 32px; background:#f9fafb; border-top:1px solid #e5e7eb; text-align:center; }
    .footer p { color:#9ca3af; font-size:12px; margin:0; }
</style>
</head>
<body>
<div class="wrapper">
    <div class="header">
        <h1>&#128161; New Idea Submitted</h1>
        <p>An employee has shared an idea through the Idea Box</p>
    </div>

    <div class="body">
        <div class="meta-row">
            <span class="badge badge-cat">{{ ucwords(str_replace('_', ' ', $idea->category)) }}</span>
            <span class="badge badge-new">New</span>
        </div>

        <p class="section-label">Idea Title</p>
        <h2 class="idea-title">{{ $idea->title }}</h2>

        <p class="section-label">Description</p>
        <div class="idea-body">{{ $idea->description }}</div>

        <div class="submitter-row">
            <p>Submitted by <strong>{{ $submitter->name }}</strong> ({{ $submitter->email }})</p>
            <p style="margin-top:4px;color:#6b7280;font-size:12px;">{{ $idea->created_at->format('D, M j Y \a\t g:i A') }}</p>
        </div>

        <div class="cta">
            <a href="{{ route('ideas.index') }}">Review Ideas in HRM</a>
        </div>
    </div>

    <div class="footer">
        <p>This notification was sent from the HRM Idea Box feature &mdash; {{ config('app.name') }}</p>
    </div>
</div>
</body>
</html>
