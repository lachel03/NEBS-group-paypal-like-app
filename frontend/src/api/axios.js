import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  withXSRFToken: true, // ✅ Axios 1.6+ will add header even cross-origin
  headers: {
    Accept: "application/json",
  },
});

// Fallback for older Axios / edge cases: copy cookie → header if missing.
api.interceptors.request.use((config) => {
  if (!config.headers) config.headers = {};
  const hasHeader =
    config.headers["X-XSRF-TOKEN"] || config.headers["x-xsrf-token"];

  if (!hasHeader) {
    const m = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
    if (m) {
      const token = decodeURIComponent(m[1]);
      config.headers["X-XSRF-TOKEN"] = token;
    }
  }
  return config;
});

export default api;
