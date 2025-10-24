<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, Hash, RateLimiter, Schema};
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\LoginLog;
use chillerlan\QRCode\QRCode;

class AuthController extends Controller
{
    // For /api/sanctum/csrf-cookie (runs under 'web' middleware)
    public function csrfCookie()
    {
        return response()->noContent();
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'full_name'     => 'required|string|max:255',
            'email'         => 'required|email|unique:users,email',
            'mobile_number' => 'required|string|min:10|max:15|unique:users,mobile_number',
            'password'      => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'full_name'     => $validated['full_name'],
            'email'         => $validated['email'],
            'mobile_number' => $validated['mobile_number'],
            'password'      => Hash::make($validated['password']),
        ]);

        // Optional: auto-login after register
        Auth::login($user);
        $request->session()->regenerate();

        return response()->json([
            'message' => 'User registered successfully.',
            'user'    => [
                'id'            => $user->id,
                'full_name'     => $user->full_name,
                'email'         => $user->email,
                'mobile_number' => $user->mobile_number,
            ],
        ], 201);
    }

    public function login(Request $request)
    {
        // Rate limit by email + IP
        $key = 'login:'.Str::lower((string)$request->email).'|'.$request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            return response()->json(['message' => 'Too many attempts. Try again later.'], 429);
        }

        $validated = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
            'otp'      => 'nullable|string',
        ]);

        $user = User::where('email', $validated['email'])->first();
        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            RateLimiter::hit($key, 60);
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        // If 2FA is enabled, require OTP before creating the session
        if ($user->two_factor_enabled) {
            if (empty($validated['otp'])) {
                return response()->json([
                    'message'      => 'Two-factor code required.',
                    'requires_2fa' => true
                ], 412);
            }

            $google2fa = app('pragmarx.google2fa');
            try {
                $secret = decrypt($user->two_factor_secret);
                if (! $google2fa->verifyKey($secret, $validated['otp'])) {
                    RateLimiter::hit($key, 60);
                    return response()->json(['message' => 'Invalid two-factor code.'], 401);
                }
            } catch (\Exception $e) {
                return response()->json(['message' => 'Invalid or corrupted 2FA secret. Please reset 2FA.'], 400);
            }
        }

        RateLimiter::clear($key);

        // Start a session login
        Auth::login($user);
        $request->session()->regenerate();

        // Optional last-login tracking
        $data = [];
        if (Schema::hasColumn('users', 'last_login_at')) $data['last_login_at'] = now();
        if (Schema::hasColumn('users', 'last_login_ip')) $data['last_login_ip'] = $request->ip();
		if (Schema::hasColumn('users', 'last_login_browser')) $data['last_login_browser'] = $this->parseBrowser($request->userAgent());
        if ($data) $user->forceFill($data)->save();

        // Activity log
        LoginLog::create([
            'user_id'    => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Login successful.',
            'user'    => $user,
        ]);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request)
    {
        return $request->user();
    }

    // 2FA: setup (generate secret + QR)
    public function setup2fa(Request $request)
    {
        $user = $request->user();
        if ($user->two_factor_enabled) {
            return response()->json(['message' => '2FA already enabled.'], 400);
        }

        $google2fa = app('pragmarx.google2fa');
        $secret = $google2fa->generateSecretKey();
        $user->update(['two_factor_secret' => encrypt($secret)]);

        $otpauthUrl = $google2fa->getQRCodeUrl('PalPay App', $user->email, $secret);
        $qrDataUri  = (new QRCode)->render($otpauthUrl);

        return response()->json([
            'message'     => '2FA secret generated successfully.',
            'qr_code'     => $qrDataUri,
            'otpauth_url' => $otpauthUrl,
        ]);
    }

    // 2FA: verify
    public function verify2fa(Request $request)
    {
        $request->validate(['otp' => 'required|string']);
        $user = $request->user();

        if (! $user->two_factor_secret) {
            return response()->json(['message' => '2FA has not been setup.'], 400);
        }

        $google2fa = app('pragmarx.google2fa');
        if (! $google2fa->verifyKey(decrypt($user->two_factor_secret), $request->otp)) {
            return response()->json(['message' => 'Invalid 2FA code.'], 400);
        }

        $user->update(['two_factor_enabled' => true]);
        return response()->json(['message' => '2FA activated successfully.']);
    }

    // 2FA: disable
    public function disable2fa(Request $request)
    {
        $request->validate(['otp' => 'required|string']);
        $user = $request->user();

        if (! $user->two_factor_secret) {
            return response()->json(['message' => '2FA is not enabled.'], 400);
        }

        $google2fa = app('pragmarx.google2fa');
        if (! $google2fa->verifyKey(decrypt($user->two_factor_secret), $request->otp)) {
            return response()->json(['message' => 'Invalid 2FA code.'], 400);
        }

        $user->update([
            'two_factor_secret'  => null,
            'two_factor_enabled' => false,
        ]);

        return response()->json(['message' => '2FA disabled successfully.']);
    }
	
	private function parseBrowser(?string $ua): ?string
	{
		if (!$ua) return null;

		// Edge (Chromium)
		if (preg_match('/Edg\/([\d\.]+)/', $ua, $m)) {
			return 'Edge ' . $m[1];
		}
		// Chrome (ignore Edge’s UA which also contains "Chrome")
		if (preg_match('/Chrome\/([\d\.]+)/', $ua, $m) && stripos($ua, 'Edg/') === false) {
			return 'Chrome ' . $m[1];
		}
		// Firefox
		if (preg_match('/Firefox\/([\d\.]+)/', $ua, $m)) {
			return 'Firefox ' . $m[1];
		}
		// Safari (exclude Chrome/Edge)
		if (stripos($ua, 'Safari/') !== false && stripos($ua, 'Chrome/') === false && stripos($ua, 'Edg/') === false) {
			if (preg_match('/Version\/([\d\.]+)/', $ua, $m)) {
				return 'Safari ' . $m[1];
			}
			return 'Safari';
		}

		// Fallback to the full UA if we can’t parse a neat label
		return $ua;
	}

}
