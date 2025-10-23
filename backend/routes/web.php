<?php

use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\Http\Controllers\CsrfCookieController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| These routes are loaded by the "web" middleware group.
| The Sanctum CSRF cookie endpoint must live here,
| not inside api.php.
|
*/

Route::get('/', fn() => response()->json(['message' => 'PalPay backend running!']));
