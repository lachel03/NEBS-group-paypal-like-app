<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use Laravel\Sanctum\Http\Controllers\CsrfCookieController;

// CSRF cookie (web middleware)
Route::get('/sanctum/csrf-cookie', [CsrfCookieController::class, 'show']);

// Put session auth under /api prefix, but still web middleware
Route::prefix('api')->middleware('web')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
    Route::post('/logout',   [AuthController::class, 'logout']);
});

