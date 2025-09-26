<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Mail;
use App\Mail\TestMail;

// Send a test email
$email = 'test@example.com';
Mail::to($email)->send(new TestMail());

echo "Test email sent to {$email}. Check your mail client to verify the branding.\n";
echo "App name is set to: " . config('app.name') . "\n";