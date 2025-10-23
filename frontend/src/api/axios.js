import axios from "axios";

// Automatically pick up base URL from your environment file (.env)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  withCredentials: true, // 🔒 allows sending cookies & Sanctum tokens
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// OPTIONAL: Automatically attach Bearer token if stored in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
