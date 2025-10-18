# 💳 PayPal-like Web Application with Secure Authentication and 2FA

A secure full-stack authentication and account management platform built with **Laravel 12 (PHP 8.2)**, **PostgreSQL 15**, **Docker Compose**, and **React + Vite + Tailwind v4**.

---

## 🚀 Features

### 🔒 Backend (Laravel 12 + Sanctum)
- Token-based authentication (`/api/register`, `/api/login`, `/api/logout`)
- Built-in CORS via `HandleCors`
- Two-Factor Authentication (2FA) using Google/Microsoft Authenticator  
  - `/api/2fa/setup`, `/api/2fa/verify`, `/api/2fa/disable`
- Login logs → stores IP + User Agent + timestamps
- PostgreSQL 15 integration
- Dockerized for local/production deployment

### 💻 Frontend (React + Vite + Tailwind v4)
- Axios setup pointing to `http://localhost:8000/api`
- Tailwind v4 configured with `@tailwindcss/postcss`
- Login / Register UI (to be integrated next)

### 🐳 Dockerized Environment
| Service | Port | Description |
|----------|------|-------------|
| **backend** | 8000 | Laravel API |
| **frontend** | 5173 | React Vite dev server |
| **db** | 5432 | PostgreSQL 15 |

---

## 🧩 Project Structure

```
palpay-group-app/
│
├── backend/           # Laravel 12 API
│   ├── app/Models
│   ├── routes/api.php
│   ├── database/migrations
│   └── .env
│
├── frontend/          # React + Vite + Tailwind
│   ├── src/
│   ├── index.css
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

---

## ⚙️ Setup & Run (Development)

### 1️⃣ Start Docker Stack
```bash
docker compose up --build
```

### 2️⃣ Access Services
- Laravel API → http://localhost:8000  
- React Frontend → http://localhost:5173  

### 3️⃣ Verify Laravel
```bash
docker exec -it palpay_backend bash
php artisan migrate:fresh
php artisan route:list
```

---

## 🧪 API Testing (Postman)

### Register
`POST /api/register`
```json
{ "name": "Test User", "email": "test@example.com", "password": "password123" }
```

### Login
`POST /api/login`
```json
{ "email": "test@example.com", "password": "password123" }
```

### 2FA Setup
`POST /api/2fa/setup`  
**Header:** `Authorization: Bearer <token>`  
→ returns QR code & secret for authenticator apps.

### 2FA Verify
`POST /api/2fa/verify`
```json
{ "otp": "123456" }
```

### View Login Logs
`GET /api/logs` (requires token)

---

## 🧰 Database Maintenance

| Action | Command |
|--------|----------|
| Clear all tables | `php artisan migrate:fresh` |
| Drop + recreate database | via `psql` inside db container |
| Wipe all volumes | `docker compose down -v` |

---

## 🧠 Common Fixes

| Issue | Cause | Fix |
|-------|--------|-----|
| Returns HTML instead of JSON | Missing `Accept: application/json` header | Add header in Postman |
| `Unauthenticated.` on logout | No bearer token | Use `Authorization: Bearer <token>` |
| `You need to install a service package` | Missing QR library | `composer require chillerlan/php-qrcode` |
| `SQLSTATE[42703] last_login_at` | Missing migration columns | Added fields + re-migrated |
| `Unsupported cipher or incorrect key length` | Invalid or empty `APP_KEY` | `php artisan key:generate && php artisan config:clear` |
| `MAC is invalid` | APP_KEY changed between runs | Regenerate key or persist same `.env` |
| Tailwind build failed | Wrong PostCSS plugin | Installed `@tailwindcss/postcss` |

---

## 📘 Next Steps
- Integrate **React Login & Register** forms with backend API  
- Build 2FA setup UI and user dashboard  
- Finalize Docker production configuration (Nginx/Caddy)

---

## 📜 License
MIT License © 2025 PalPay Group App Team
