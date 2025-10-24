<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use Laravel\Sanctum\Http\Controllers\CsrfCookieController;

// ✅ CSRF cookie at /api/sanctum/csrf-cookie
Route::prefix('api')->middleware('web')->group(function () {
    Route::get('/sanctum/csrf-cookie', [CsrfCookieController::class, 'show']);

    // (session-based auth endpoints)
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
    Route::post('/logout',   [AuthController::class, 'logout']);
});
