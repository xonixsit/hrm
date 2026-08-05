<?php
require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$deleted = \Illuminate\Support\Facades\DB::table('chat_heartbeats')->delete();
echo "Cleared {$deleted} stale heartbeat(s).\n";
