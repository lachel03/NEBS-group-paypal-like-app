// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  withCredentials: true,                // <-- important
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

// Remove the Bearer-token interceptor:
// api.interceptors.request.use(...)  <-- delete this
export default api;
