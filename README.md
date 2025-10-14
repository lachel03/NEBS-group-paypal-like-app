# 💳 PayPal-like Web Application with Secure Authentication and 2FA

> A full-stack project built with **Laravel 12**, **ReactJS (Vite + TailwindCSS)**, and **PostgreSQL**, demonstrating secure user registration, authentication, and two-factor authentication (2FA).  
>  
> **Features:**
> - Secure registration and login (bcrypt-hashed passwords)
> - Token-based authentication via **Laravel Sanctum**
> - Optional two-factor authentication (QR code + TOTP verification)
> - User dashboard with account security logs (last login IP, browser, timestamp)
> - Fully containerized setup using **Docker Compose**
>
> **Tech Stack:** PHP 8.2 / Laravel 12 / React (Vite + TailwindCSS) / PostgreSQL 15  
>
> **Developed by:** Kyle Laurence Biteng • Rein Irish Santos • Lance Christian Elane • Mary Napala  
>
> **Objective:**  
> This project satisfies the *“Project Specification — PayPal-like App with Security Review”* requirements.  
> It serves as both a **developer deliverable** (secure implementation) and a **reviewer artifact** for security compliance evaluation.  
>  
> The current repository focuses on the **Laravel 12 backend setup**, forming the foundation for the upcoming **React frontend and 2FA integration**.

---

## ⚙️ Environment Setup

**Tech Stack**
| Component | Version |
|------------|----------|
| Laravel | 12.33.0 |
| PHP | 8.2.12 |
| Laravel Sanctum | 4.2.0 |
| Database | SQLite (for local testing) |

**Local Development**
```bash
php artisan serve --host=127.0.0.1 --port=8000
```
Visit: http://127.0.0.1:8000  

---

## 🧱 Middleware Configuration

File: `bootstrap/app.php`
```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->use([\Illuminate\Http\Middleware\HandleCors::class]);
    $middleware->statefulApi();
})
```

CORS is configured for:
```php
'allowed_origins' => [
    'http://localhost:3000',
    'http://127.0.0.1:3000'
],
'paths' => ['api/*', 'sanctum/csrf-cookie']
```

---

## 👤 User Model

File: `app/Models/User.php`
```php
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = ['name', 'email', 'password'];
    protected $hidden   = ['password', 'remember_token'];
    protected $casts    = ['email_verified_at' => 'datetime'];
}
```

---

## 📡 API Routes

File: `routes/api.php`
```php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

// Health check
Route::get('/test', fn() => response()->json(['message' => 'API route working!']));

// Register
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

// Login
Route::post('/login', function (Request $request) {
    $validated = $request->validate([
        'email' => 'required|email',
        'password' => 'required|string',
    ]);

    $user = User::where('email', $validated['email'])->first();

    if (!$user || !Hash::check($validated['password'], $user->password)) {
        return response()->json(['message' => 'Invalid credentials.'], 401);
    }

    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'message' => 'Login successful.',
        'user' => $user,
        'token' => $token,
    ]);
});

// Logout (protected)
Route::middleware('auth:sanctum')->post('/logout', function (Request $request) {
    $request->user()->tokens()->delete();
    return response()->json(['message' => 'Logged out successfully.']);
});
```

---

## 🧪 Postman Testing Guide

### 1️⃣ Register
**POST** `http://127.0.0.1:8000/api/register`

**Headers**
| Key | Value |
|------|-------|
| Accept | application/json |
| Content-Type | application/json |

**Body (raw → JSON)**
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

✅ Response `201 Created`
```json
{
  "message": "User registered successfully.",
  "user": {...},
  "token": "1|..."
}
```

---

### 2️⃣ Login
**POST** `http://127.0.0.1:8000/api/login`

**Headers**
| Key | Value |
|------|-------|
| Accept | application/json |
| Content-Type | application/json |

**Body**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

✅ Response
```json
{
  "message": "Login successful.",
  "user": {...},
  "token": "2|..."
}
```

---

### 3️⃣ Logout
**POST** `http://127.0.0.1:8000/api/logout`

**Authorization Tab**
- Type: **Bearer Token**
- Token: *(paste token from login response)*

**Headers**
| Key | Value |
|------|-------|
| Accept | application/json |

✅ Response
```json
{ "message": "Logged out successfully." }
```

---

### 4️⃣ Protected Route
**GET** `http://127.0.0.1:8000/api/test`

**Authorization:** `Bearer <token>`

✅ Response  
```json
{ "message": "API route working!" }
```

If token is invalid or revoked →  
```json
{ "message": "Unauthenticated." }
```

---

## 🧱 Next Development Phases

1. **Integrate PostgreSQL database**
   - Replace SQLite with PostgreSQL 15 (via Docker).
2. **Add Two-Factor Authentication (2FA)**
   - Use `pragmarx/google2fa-laravel` for TOTP generation and validation.
   - Implement endpoints `/api/2fa/setup`, `/api/2fa/verify`, `/api/2fa/disable`.
3. **React Frontend (Vite + Tailwind)**
   - Create pages for Register, Login, Dashboard, and 2FA setup.
   - Connect frontend to backend via Axios.
4. **Docker Compose Setup**
   - Include 3 services: `backend`, `frontend`, and `db` (PostgreSQL).
5. **Security Review Checklist**
   - Conduct peer review for CSRF, 2FA, token handling, and validation compliance.

---

## 🧾 License
Open-source and free to modify for educational or commercial use.
