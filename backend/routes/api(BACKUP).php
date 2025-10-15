<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\LoginLog;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| These are the main authentication endpoints for your project.
| - /api/register  → create user
| - /api/login     → login user
| - /api/logout    → logout (requires Sanctum token)
|--------------------------------------------------------------------------
*/

// ✅ Test route (check if API is working)
Route::get('/test', function () {
    return response()->json(['message' => 'API route working!']);
});

// ✅ REGISTER
Route::post('/register', function (Request $request) {
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email',
        'password' => 'required|string|min:8',
    ]);

    $user = User::create([
        'name' => $validated['name'],
        'email' => $validated['email'],
        'password' => Hash::make($validated['password']),
    ]);

    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'message' => 'User registered successfully.',
        'user' => $user,
        'token' => $token,
    ]);
});

// ✅ LOGIN
// Route::post('/login', function (Request $request) {
//    $validated = $request->validate([
//        'email' => 'required|email',
//        'password' => 'required|string',
//    ]);
//
//    $user = User::where('email', $validated['email'])->first();
//
//    if (! $user || ! Hash::check($validated['password'], $user->password)) {
//        return response()->json(['message' => 'Invalid credentials.'], 401);
//    }
//
//    $token = $user->createToken('auth_token')->plainTextToken;
//
//    return response()->json([
//        'message' => 'Login successful.',
//        'user' => $user,
//        'token' => $token,
//    ]);
// });

Route::post('/login', function (Request $request) {
    $validated = $request->validate([
        'email' => 'required|email',
        'password' => 'required|string',
    ]);

    $user = User::where('email', $validated['email'])->first();

    if (!$user || !Hash::check($validated['password'], $user->password)) {
        return response()->json(['message' => 'Invalid credentials.'], 401);
    }

    // 🧾 Create the access token
    $token = $user->createToken('auth_token')->plainTextToken;

    // 🧠 Record login activity
    LoginLog::create([
        'user_id'    => $user->id,
        'ip_address' => $request->ip(),
        'user_agent' => $request->userAgent(),
    ]);

    // 🕒 Update last login details
    $user->update([
        'last_login_at' => now(),
        'last_login_ip' => $request->ip(),
    ]);

    return response()->json([
        'message' => 'Login successful.',
        'user' => $user,
        'token' => $token,
    ]);
});


// ✅ LOGOUT (Protected)
Route::middleware('auth:sanctum')->post('/logout', function (Request $request) {
    $request->user()->tokens()->delete();

    return response()->json(['message' => 'Logged out successfully.']);
});


// logs endpoint
Route::middleware('auth:sanctum')->get('/logs', function (Request $request) {
    // Fetch recent 10 login logs for the authenticated user
    $logs = LoginLog::where('user_id', $request->user()->id)
        ->orderBy('created_at', 'desc')
        ->take(10)
        ->get(['ip_address', 'user_agent', 'created_at']);

    return response()->json([
        'message' => 'Recent login activity fetched successfully.',
        'data' => $logs
    ]);
});