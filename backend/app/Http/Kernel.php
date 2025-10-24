<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

class Kernel extends HttpKernel
{
    /**
     * Global HTTP middleware stack.
     * These run on every request to your application.
     */
    protected $middleware = [
        // Trust proxies (if you’re behind Docker/nginx, keep this)
        \App\Http\Middleware\TrustProxies::class,

        // Handle CORS according to config/cors.php
        \Illuminate\Http\Middleware\HandleCors::class,

        // Prevent requests during maintenance
        \App\Http\Middleware\PreventRequestsDuringMaintenance::class,

        // Limit POST size
        \Illuminate\Foundation\Http\Middleware\ValidatePostSize::class,

        // Trim strings on input
        \App\Http\Middleware\TrimStrings::class,

        // Convert empty strings to null
        \Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class,
    ];

    /**
     * Route middleware groups.
     */
    protected $middlewareGroups = [
        'web' => [
            // Cookie + session stack
            \App\Http\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
            // \Illuminate\Session\Middleware\AuthenticateSession::class, // optional (if you need)
            \Illuminate\View\Middleware\ShareErrorsFromSession::class,

            // CSRF protection
            \App\Http\Middleware\VerifyCsrfToken::class,

            // Route model binding, etc.
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],

        'api' => [
            /**
             * ⭐️ CRITICAL FOR SANCTUM SPA SESSIONS ⭐️
             * This makes Sanctum treat requests from your SPA (stateful domains)
             * as session-authenticated instead of requiring bearer tokens.
             */
            EnsureFrontendRequestsAreStateful::class,

            // Throttle API if you want (optional)
            // \Illuminate\Routing\Middleware\ThrottleRequests::class . ':api',

            // Route model binding, etc.
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],
    ];

    /**
     * Route middleware aliases.
     * You can assign these to routes/groups in your routes files.
     */
    protected $middlewareAliases = [
        'auth'             => \App\Http\Middleware\Authenticate::class,
        'auth.basic'       => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
        'auth.session'     => \Illuminate\Session\Middleware\AuthenticateSession::class,
        'cache.headers'    => \Illuminate\Http\Middleware\SetCacheHeaders::class,
        'can'              => \Illuminate\Auth\Middleware\Authorize::class,
        'guest'            => \App\Http\Middleware\RedirectIfAuthenticated::class,
        'password.confirm' => \Illuminate\Auth\Middleware\RequirePassword::class,
        'signed'           => \Illuminate\Routing\Middleware\ValidateSignature::class,
        'throttle'         => \Illuminate\Routing\Middleware\ThrottleRequests::class,
        'verified'         => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,

        // Sanctum's guard (used in routes: ->middleware('auth:sanctum'))
        // Note: Sanctum registers its own service provider; nothing to add here.
    ];
}
