# 💳 PalPay — Web App with Secure Auth, 2FA, and Session-based Sanctum

A secure full-stack authentication and account management platform built with **Laravel 12 (PHP 8.2)**, **PostgreSQL 15**, **Docker Compose**, and **React + Vite + Tailwind v4**.

---

## 🚀 Features

### 🔒 Backend (Laravel 12 + Sanctum, **Session + CSRF**)

* **Session-based** authentication with **CSRF** (no Bearer tokens for SPA)

  * Endpoints (under `/api`):

    * `GET /sanctum/csrf-cookie` (bootstrap CSRF + session)
    * `POST /register`, `POST /login`, `POST /logout` (session)
    * `GET /user` (requires `auth:sanctum`)
* **Two-Factor Authentication (2FA)** using TOTP (Google/Microsoft Authenticator)

  * `POST /2fa/setup`, `POST /2fa/verify`, `POST /2fa/disable` (all require `auth:sanctum`)
* **Login logs** (IP, User Agent, timestamp) + **last login fields** on users:

  * `last_login_at`, `last_login_ip`, **`last_login_browser`**
* **Formatted date fields** appended on user JSON:

  * `last_login_at_fmt`, `created_at_fmt`, `updated_at_fmt`
* CORS enabled via `HandleCors`
* PostgreSQL 15 integration
* Dockerized for local dev

### 💻 Frontend (React + Vite + Tailwind v4)

* Axios **session** config (`withCredentials: true`) pointing to `http://localhost:8000/api`
* **CSRF bootstrap** helper (calls `/sanctum/csrf-cookie` once per tab)
* Pages wired to session flow:

  * **Register.jsx** → `POST /register`
  * **Login.jsx** → `POST /login` (+ optional OTP step when required)
  * **Dashboard.jsx** → shows profile, 2FA controls, last login info (IP, **browser**)
  * **Logs.jsx** → loads `GET /logs` then returns to Dashboard
* Tailwind v4 via `@tailwindcss/postcss`

### 🐳 Dockerized Environment

|  Service | Port | Description           |
| -------: | :--: | --------------------- |
|  backend | 8000 | Laravel API           |
| frontend | 5173 | React Vite dev server |
|       db | 5432 | PostgreSQL 15         |

---

## 🧩 Project Structure

```
palpay-group-app/
│
├── backend/                 # Laravel 12 API
│   ├── app/Http/Controllers/AuthController.php
│   ├── app/Models/User.php
│   ├── app/Http/Kernel.php
│   ├── routes/api.php       # protected APIs (auth:sanctum)
│   ├── routes/web.php       # csrf-cookie + login/register/logout (web)
│   ├── database/migrations  # includes last_login_* columns
│   └── .env
│
├── frontend/                # React + Vite + Tailwind
│   ├── src/api/axios.js
│   ├── src/pages/{Login,Register,Dashboard,Logs}.jsx
│   ├── src/App.jsx
│   └── index.css
│
├── docker-compose.yml
└── README.md
```

---

## ⚙️ Setup & Run (Development)

### 1) Environment

`backend/.env` (key lines):

```
APP_URL=http://localhost:8000
APP_TIMEZONE=Asia/Manila

SESSION_DRIVER=file
SESSION_DOMAIN=localhost
SESSION_COOKIE=palpay-session

SANCTUM_STATEFUL_DOMAINS=localhost:5173

DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=palpay_db
DB_USERNAME=postgres
DB_PASSWORD=password123
```

**CORS** (`config/cors.php`):

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => ['http://localhost:5173'],
'supports_credentials' => true,
```

**Sanctum stateful** (`app/Http/Kernel.php` → `api` group):

```php
\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
```

### 2) Start Docker Stack

```bash
docker compose up --build
```

### 3) Migrate DB & verify

```bash
docker exec -it palpay_backend bash
php artisan migrate
php artisan route:list
```

> We fixed the **APP_KEY stacking** in Docker: the key is generated **only if missing**, not appended.

### 4) Frontend Axios (session + CSRF)

`frontend/src/api/axios.js`:

```js
import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  withXSRFToken: true,
  headers: { Accept: "application/json" },
});
export default api;
```

**Usage pattern in pages**:

1. `await api.get('/sanctum/csrf-cookie')`
2. `await api.post('/login', {...})`
3. Authenticated calls (e.g., `GET /user`, `GET /logs`)

---

## 🔀 Routing (Server)

**`routes/web.php`** (web middleware + `/api` prefix)

* `GET /api/sanctum/csrf-cookie`
* `POST /api/register`
* `POST /api/login`
* `POST /api/logout`

**`routes/api.php`** (protected via `auth:sanctum`)

* `GET /api/user`
* `GET /api/logs`
* `POST /api/2fa/setup`
* `POST /api/2fa/verify`
* `POST /api/2fa/disable`

---

## 🧪 API Quick Test (curl)

```bash
# 1) CSRF cookie
curl -i -c cookies.txt http://localhost:8000/api/sanctum/csrf-cookie

# 2) Login (copy XSRF-TOKEN value from cookies.txt)
curl -i -b cookies.txt -c cookies.txt \
  -H "X-XSRF-TOKEN: <XSRF-TOKEN>" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -X POST http://localhost:8000/api/login \
  -d '{"email":"test@example.com","password":"password123"}'

# 3) Authenticated
curl -i -b cookies.txt http://localhost:8000/api/user
curl -i -b cookies.txt http://localhost:8000/api/logs
```

---

## 🛢️ Data Model

**`users` (key columns)**

* `full_name`, `email (unique)`, `mobile_number (unique)`, `password`
* `two_factor_secret (nullable, encrypted)`, `two_factor_enabled (bool)`
* `last_login_at (nullable)`, `last_login_ip (nullable)`, **`last_login_browser (nullable)`**
* Timestamps: `created_at`, `updated_at`
* **Appended (read-only) JSON accessors:**
  `last_login_at_fmt`, `created_at_fmt`, `updated_at_fmt` (Manila time)

**`login_logs`**

* `user_id`, `ip_address`, `user_agent`, `created_at`

---

## 🔐 2FA Flow (TOTP)

1. `POST /api/2fa/setup` → returns otpauth URL + QR data URI.
2. Scan in authenticator app.
3. `POST /api/2fa/verify` with `{"otp":"123456"}` → enables 2FA.
4. `POST /api/2fa/disable` with a valid OTP.

> Login requires OTP when `two_factor_enabled=true` (server returns `412 requires_2fa=true` if OTP not provided).

---

## 🧠 Common Pitfalls & Fixes

| Symptom                                 | Likely Cause                                  | Fix                                                                                             |
| --------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **419 CSRF token mismatch** on `/login` | Axios not sending `X-XSRF-TOKEN`              | Use `withCredentials`, `withXSRFToken: true`, and call `/sanctum/csrf-cookie` first             |
| **401 Unauthenticated** on `/user`      | Not logged in yet (or session not recognized) | Ensure login succeeded, cookies sent, and `EnsureFrontendRequestsAreStateful` in `Kernel.php`   |
| **MAC is invalid / Unsupported cipher** | Bad `APP_KEY`                                 | Generate once, don’t append; `php artisan key:generate` and persist `.env`                      |
| **SQLSTATE column missing**             | Migrations not applied                        | `php artisan migrate`                                                                           |
| **CORS errors**                         | Wrong CORS config                             | `supports_credentials: true`, allow `http://localhost:5173`, include `sanctum/csrf-cookie` path |

---

## 🧰 Database Maintenance

| Action       | Command                      |
| ------------ | ---------------------------- |
| Reset DB     | `php artisan migrate:fresh`  |
| Clear caches | `php artisan optimize:clear` |
| Nuke volumes | `docker compose down -v`     |

---

## ✅ Frontend UX Notes

* Dashboard shows **Total Balance (mock)**, profile, **2FA status**, last login **IP + Browser**, and **Member Since** (using `*_fmt` fields).
* Logs page shows last 10 login entries with **browser label**, IP, and formatted time; back button returns to Dashboard.

---

## 👥 Contributors

- **Developer Team:**
- zeroh21  (Frontend) - [GitHub Profile](https://github.com/zeroh21) | [Alt](https://github.com/0H21)
- Lachel03 (Backend) - [GitHub Profile](https://github.com/lachel03)

## 📜 License

MIT License © 2025 PalPay Group App Team
Built in compliance for IAS2 Course - October 2025
