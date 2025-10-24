<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// Health
Route::get('/test', fn() => response()->json(['message' => 'API route working!']));

// Protected (session satisfies auth:sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user',         [AuthController::class, 'me']);
    Route::get('/logs',         [AuthController::class, 'logs']);
    Route::post('/2fa/setup',   [AuthController::class, 'setup2fa']);
    Route::post('/2fa/verify',  [AuthController::class, 'verify2fa']);
    Route::post('/2fa/disable', [AuthController::class, 'disable2fa']);
});
