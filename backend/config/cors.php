<?php

return [

    /*
    |--------------------------------------------------------------------------
    | CORS Configuration for PalPay
    |--------------------------------------------------------------------------
    |
    | These settings ensure your React frontend (Vite on port 5173)
    | can securely communicate with the Laravel backend (port 8000)
    | using Sanctum + CSRF cookies and 2FA endpoints.
    |
    */

    'paths' => [
        'api/*',                // ✅ Covers /api/register, /api/login, /api/2fa/*
        'sanctum/csrf-cookie',  // ✅ Required for CSRF protection
        'login',
        'logout',
        'register',
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,
];
