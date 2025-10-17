<?php

use Illuminate\Support\Facades\Route; // ✅ Route facade
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Schema;

use App\Models\User;
use App\Models\LoginLog;

// For 2FA + QR rendering
use chillerlan\QRCode\QRCode;

// ---------- HEALTH ----------
Route::get('/test', fn() => response()->json(['message' => 'API route working!']));

// ---------- REGISTER ----------
Route::post('/register', function (Request $request) {
    $validated = $request->validate([
        'name'     => 'required|string|max:255',
        'email'    => 'required|email|unique:users,email',
        'password' => 'required|string|min:8',
    ]);

    $user = User::create([
        'name'     => $validated['name'],
        'email'    => $validated['email'],
        'password' => Hash::make($validated['password']),
    ]);

    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'message' => 'User registered successfully.',
        'user'    => $user,
        'token'   => $token,
    ], 201);
});

// ---------- LOGIN (2FA-aware + rate limit) ----------
Route::post('/login', function (Request $request) {
    // basic rate limiting per IP+email
    $key = 'login:'.Str::lower((string)$request->email).'|'.$request->ip();
    if (RateLimiter::tooManyAttempts($key, 5)) {
        return response()->json(['message' => 'Too many attempts. Try again later.'], 429);
    }

    $validated = $request->validate([
        'email'    => 'required|email',
        'password' => 'required|string',
        'otp'      => 'nullable|string' // only required if 2FA enabled
    ]);

    $user = User::where('email', $validated['email'])->first();

    if (! $user || ! Hash::check($validated['password'], $user->password)) {
        RateLimiter::hit($key, 60); // lockout window
        return response()->json(['message' => 'Invalid credentials.'], 401);
    }

    // If 2FA is enabled, require valid OTP
    if ($user->two_factor_enabled) {
        if (empty($validated['otp'])) {
            return response()->json([
                'message'      => 'Two-factor code required.',
                'requires_2fa' => true,
            ], 412); // Precondition Required
        }

        $google2fa = app('pragmarx.google2fa');
        try {
			$secret = decrypt($user->two_factor_secret);
			$valid  = $google2fa->verifyKey($secret, $validated['otp']);
		} catch (\Exception $e) {
			return response()->json(['message' => 'Invalid or corrupted 2FA secret. Please reset 2FA.'], 400);
		}


        if (! $valid) {
            RateLimiter::hit($key, 60);
            return response()->json(['message' => 'Invalid two-factor code.'], 401);
        }
    }

    RateLimiter::clear($key);

    // Issue token + log activity
    $token = $user->createToken('auth_token')->plainTextToken;

    LoginLog::create([
        'user_id'    => $user->id,
        'ip_address' => $request->ip(),
        'user_agent' => $request->userAgent(),
    ]);

	$data = [];
	if (Schema::hasColumn('users', 'last_login_at')) $data['last_login_at'] = now();
	if (Schema::hasColumn('users', 'last_login_ip')) $data['last_login_ip'] = $request->ip();
	if ($data) $user->forceFill($data)->save();

    return response()->json([
        'message' => 'Login successful.',
        'user'    => $user,
        'token'   => $token,
    ]);
});

// ---------- LOGOUT ----------
Route::middleware('auth:sanctum')->post('/logout', function (Request $request) {
    $request->user()->currentAccessToken()?->delete();
    return response()->json(['message' => 'Logged out successfully.']);
});

// ---------- LOGIN LOGS (recent 10) ----------
Route::middleware('auth:sanctum')->get('/logs', function (Request $request) {
    $logs = LoginLog::where('user_id', $request->user()->id)
        ->latest()
        ->take(10)
        ->get(['ip_address', 'user_agent', 'created_at']);

    return response()->json([
        'message' => 'Recent login activity fetched successfully.',
        'data'    => $logs
    ]);
});

// ==================== 2FA ENDPOINTS ====================

// 1) SETUP — generate secret & inline QR using chillerlan/php-qrcode
Route::middleware('auth:sanctum')->post('/2fa/setup', function (Request $request) {
    $user = $request->user();

    if ($user->two_factor_enabled) {
        return response()->json(['message' => '2FA already enabled.'], 400);
    }

    $google2fa = app('pragmarx.google2fa');

    // 1) Generate and store encrypted secret
    $secret = $google2fa->generateSecretKey();
    $user->update(['two_factor_secret' => encrypt($secret)]);

    // 2) Build otpauth:// URL for authenticator apps
    $otpauthUrl = $google2fa->getQRCodeUrl(
        'PalPay App',   // issuer (your app name)
        $user->email,   // account label
        $secret
    );

    // 3) Render inline QR (data:image/png;base64,...) via chillerlan
    $qrDataUri = (new QRCode)->render($otpauthUrl);

    return response()->json([
        'message'     => '2FA secret generated successfully.',
        'qr_code'     => $qrDataUri,   // put directly into <img src="...">
        'otpauth_url' => $otpauthUrl,  // handy for debugging/fallback
        // 'secret'    => $secret       // omit in production UI if you prefer
    ]);
});

// 2) VERIFY — user enters the 6-digit TOTP to activate 2FA
Route::middleware('auth:sanctum')->post('/2fa/verify', function (Request $request) {
    $request->validate(['otp' => 'required|string']);

    $user      = $request->user();
    $google2fa = app('pragmarx.google2fa');

    if (! $user->two_factor_secret) {
        return response()->json(['message' => '2FA has not been setup.'], 400);
    }

    $valid = $google2fa->verifyKey(decrypt($user->two_factor_secret), $request->otp);

    if (! $valid) {
        return response()->json(['message' => 'Invalid 2FA code.'], 400);
    }

    $user->update(['two_factor_enabled' => true]);

    return response()->json(['message' => '2FA activated successfully.']);
});

// 3) DISABLE — re-verify a code then remove secret
Route::middleware('auth:sanctum')->post('/2fa/disable', function (Request $request) {
    $request->validate(['otp' => 'required|string']);

    $user      = $request->user();
    $google2fa = app('pragmarx.google2fa');

    if (! $user->two_factor_secret) {
        return response()->json(['message' => '2FA is not enabled.'], 400);
    }

    $valid = $google2fa->verifyKey(decrypt($user->two_factor_secret), $request->otp);

    if (! $valid) {
        return response()->json(['message' => 'Invalid 2FA code.'], 400);
    }

    $user->update([
        'two_factor_secret'  => null,
        'two_factor_enabled' => false,
    ]);

    return response()->json(['message' => '2FA disabled successfully.']);
});
