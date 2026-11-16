<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Referral Status Update</title>
<style>
  body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 8px; overflow: hidden; }
  .header { background: linear-gradient(135deg, #0d9488, #0891b2); padding: 32px; text-align: center; }
  .header h1 { color: #fff; margin: 0; font-size: 22px; }
  .header p  { color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px; }
  .body { padding: 32px; }
  .status-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
  .status-box .label { font-size: 12px; color: #6b7280; margin-bottom: 6px; }
  .status-box .status { font-size: 20px; font-weight: 700; color: #15803d; }
  .row { display: flex; margin-bottom: 10px; }
  .label { width: 140px; font-size: 13px; color: #6b7280; flex-shrink: 0; }
  .value { font-size: 13px; color: #111827; font-weight: 600; }
  .note-box { background: #f9fafb; border-left: 4px solid #0d9488; padding: 12px 16px; border-radius: 4px; margin-top: 20px; font-size: 13px; color: #374151; }
  .footer { background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 32px; text-align: center; font-size: 12px; color: #9ca3af; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>📋 Referral Status Update</h1>
    <p>Your referral has been reviewed</p>
  </div>
  <div class="body">
    <p style="font-size:14px;color:#374151;">Hi <strong>{{ $referrer->name }}</strong>,</p>
    <p style="font-size:13px;color:#6b7280;">Your referral for <strong>{{ $referral->candidate_name }}</strong> has been updated.</p>

    <div class="status-box">
      <div class="label">Current Status</div>
      <div class="status">{{ $referral->status_label }}</div>
    </div>

    <div class="row"><span class="label">Candidate</span><span class="value">{{ $referral->candidate_name }}</span></div>
    <div class="row"><span class="label">Position</span><span class="value">{{ $referral->position }}</span></div>
    <div class="row"><span class="label">Reviewed At</span><span class="value">{{ $referral->reviewed_at?->format('M d, Y') }}</span></div>

    @if($referral->admin_notes)
    <div class="note-box"><strong>Admin Notes:</strong> {{ $referral->admin_notes }}</div>
    @endif

    <p style="margin-top:24px;font-size:13px;color:#6b7280;">
      You can view the full details in the HR Management system under Employee Referrals.
    </p>
  </div>
  <div class="footer">Xonobics HR Management System &bull; Sent automatically</div>
</div>
</body>
</html>
