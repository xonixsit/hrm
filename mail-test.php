<?php

require 'vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Mail;

echo "Sending test email...\n";

try {
    Mail::raw('Test email from HR Management System', function($message) {
        $message->to('xonixsit@outlook.com')
               ->subject('Test Email');
    });
    echo "Email sent successfully!\n";
} catch (Exception $e) {
    echo "Error sending email: " . $e->getMessage() . "\n";
}