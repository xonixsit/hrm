<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Reverb Server
    |--------------------------------------------------------------------------
    |
    | This option controls the default Reverb server that will be used by the
    | framework when broadcasting events. You may set this to any of the
    | servers defined in the "servers" array below.
    |
    */

    'default' => env('REVERB_SERVER', 'reverb'),

    /*
    |--------------------------------------------------------------------------
    | Reverb Servers
    |--------------------------------------------------------------------------
    |
    | Here you may define all of the Reverb servers that will be used to
    | broadcast events to other systems or over websockets. Samples of
    | each available type of connection are provided inside this array.
    |
    */

    'servers' => [
        'reverb' => [
            'host' => env('REVERB_SERVER_HOST', '0.0.0.0'),
            'port' => env('REVERB_SERVER_PORT', 8080),
            'hostname' => env('REVERB_HOST'),
            'options' => [
                'tls' => [],
            ],
            'scaling' => [
                'enabled' => env('REVERB_SCALING_ENABLED', false),
                'channel' => env('REVERB_SCALING_CHANNEL', 'reverb'),
            ],
            'pulse_ingest_interval' => env('REVERB_PULSE_INGEST_INTERVAL', 60),
            'telescope_ingest_interval' => env('REVERB_TELESCOPE_INGEST_INTERVAL', 15),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Reverb Applications
    |--------------------------------------------------------------------------
    |
    | Here you may define all of the Reverb applications that will be used
    | to authenticate connections to your Reverb server. Each application
    | has its own set of credentials and allowed origins.
    |
    */

    'apps' => [

        [
            'app_id' => env('REVERB_APP_ID', 'my-app-id'),
            'app_key' => env('REVERB_APP_KEY', 'my-app-key'),
            'app_secret' => env('REVERB_APP_SECRET', 'my-app-secret'),
            'allowed_origins' => ['*'],
            'ping_interval' => env('REVERB_APP_PING_INTERVAL', 30),
            'max_message_size' => env('REVERB_APP_MAX_MESSAGE_SIZE', 10000),
        ],

    ],

];
