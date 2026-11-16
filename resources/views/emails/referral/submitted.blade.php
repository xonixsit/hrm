<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>New Employee Referral</title>
<style>
  body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 8px; overflow: hidden; }
  .header { background: linear-gradient(135deg, #0d9488, #0891b2); padding: 32px; text-align: center; }
  .header h1 { color: #fff; margin: 0; font-size: 22px; }
  .header p  { color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px; }
  .body { padding: 32px; }
  .row { display: flex; margin-bottom: 12px; }
  .label { width: 140px; font-size: 13px; color: #6b7280; flex-shrink: 0; }
  .value { font-size: 13px; color: #111827; font-weight: 600; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; background: #dbeafe; color: #1d4ed8; }
  .section-title { font-size: 15px; font-weight: 700; color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin: 24px 0 16px; }
  .footer { background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 32px; text-align: center; font-size: 12px; color: #9ca3af; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>🤝 New Employee Referral</h1>
    <p>A team member has referred a candidate</p>
  </div>
  <div class="body">
    <div class="section-title">Referred By</div>
    <div class="row"><span class="label">Employee</span><span class="value">{{ $referrer->name }}</span></div>
    <div class="row"><span class="label">Email</span><span class="value">{{ $referrer->email }}</span></div>

    <div class="section-title">Candidate Details</div>
    <div class="row"><span class="label">Name</span><span class="value">{{ $referral->candidate_name }}</span></div>
    <div class="row"><span class="label">Email</span><span class="value">{{ $referral->candidate_email }}</span></div>
    @if($referral->candidate_phone)
    <div class="row"><span class="label">Phone</span><span class="value">{{ $referral->candidate_phone }}</span></div>
    @endif
    <div class="row"><span class="label">Position</span><span class="value">{{ $referral->position }}</span></div>
    @if($referral->department)
    <div class="row"><span class="label">Department</span><span class="value">{{ $referral->department }}</span></div>
    @endif
    <div class="row"><span class="label">Relationship</span><span class="value">{{ $referral->relationship }}</span></div>
    @if($referral->note)
    <div class="row"><span class="label">Note</span><span class="value">{{ $referral->note }}</span></div>
    @endif
    <div class="row"><span class="label">Status</span><span class="badge">{{ $referral->status_label }}</span></div>

    <p style="margin-top:24px;font-size:13px;color:#6b7280;">
      Please review this referral in the HR Management system and update the status accordingly.
    </p>
  </div>
  <div class="footer">Xonobics HR Management System &bull; Sent automatically</div>
</div>
</body>
</html>
