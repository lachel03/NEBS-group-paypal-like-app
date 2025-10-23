import { useState } from "react";
import api from "../api/axios";

export default function Login({ switchToRegister, onLoginSuccess }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (status.message) setStatus({ message: "", type: "" });
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/login", formData);

      // Save token & user in localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setStatus({ message: "Login successful!", type: "success" });

      // Optional: callback to switch page
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(res.data.user);
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);
      const msg =
        error.response?.data?.message || "Invalid credentials or network error.";
      setStatus({ message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-cyan-500 rounded-full blur-3xl opacity-20 -top-48 -left-48 animate-pulse"></div>
        <div
          className="absolute w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 -bottom-48 -right-48 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 relative z-10">
        {/* LEFT: Login Form */}
        <div className="bg-slate-900 bg-opacity-60 backdrop-blur-xl border border-cyan-500 border-opacity-30 rounded-2xl p-8 shadow-2xl relative">
          <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-cyan-400 rounded-tl-2xl"></div>
          <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-cyan-400 rounded-br-2xl"></div>

          <div className="relative">
            <h1 className="text-3xl font-bold mb-2 text-cyan-400 tracking-wider">
              Sign in to PalPay
            </h1>
            <p className="text-cyan-300 text-sm mb-6 opacity-70">
              Access your account securely and manage your funds with confidence.
            </p>

            <div className="space-y-4">
              {/* EMAIL */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className={`w-full pl-12 pr-4 py-3 bg-slate-800 bg-opacity-50 border ${
                    errors.email ? "border-red-500" : "border-cyan-500 border-opacity-30"
                  } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition`}
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* PASSWORD */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className={`w-full pl-12 pr-12 py-3 bg-slate-800 bg-opacity-50 border ${
                    errors.password
                      ? "border-red-500"
                      : "border-cyan-500 border-opacity-30"
                  } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400 hover:text-cyan-300"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* STATUS MESSAGE */}
              {status.message && (
                <p
                  className={`text-center mt-4 text-sm ${
                    status.type === "success"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {status.message}
                </p>
              )}

              {/* SUBMIT */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold py-3 rounded-lg shadow-lg shadow-cyan-500/50 transition transform ${
                  loading
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:scale-105 hover:shadow-cyan-400/60"
                }`}
              >
                {loading ? "Signing in..." : "Login"}
              </button>

              {/* LINK */}
              <div className="flex justify-center items-center mt-6 text-sm">
                <span className="text-gray-400">Don’t have an account?</span>
                <button
                  type="button"
                  onClick={switchToRegister}
                  className="ml-2 text-cyan-400 hover:text-cyan-300 transition font-medium"
                >
                  Register here
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Branding */}
        <div className="flex flex-col justify-center text-white space-y-6 p-8">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            PALPAY BANKING
          </h1>
          <div className="h-px bg-gradient-to-r from-cyan-500 to-transparent w-3/4"></div>
          <p className="text-2xl text-cyan-200 font-light leading-relaxed">
            The Future of Digital Finance
          </p>
          <p className="text-lg text-slate-300 leading-relaxed">
            Experience seamless, secure, and intelligent banking solutions powered by cutting-edge technology. Your financial freedom starts here.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <span className="px-4 py-2 bg-cyan-500 bg-opacity-20 border border-cyan-400 border-opacity-30 rounded-full text-cyan-300 text-sm">
              ⚡ Instant Transfers
            </span>
            <span className="px-4 py-2 bg-cyan-500 bg-opacity-20 border border-cyan-400 border-opacity-30 rounded-full text-cyan-300 text-sm">
              🔒 Bank-Level Security
            </span>
            <span className="px-4 py-2 bg-cyan-500 bg-opacity-20 border border-cyan-400 border-opacity-30 rounded-full text-cyan-300 text-sm">
              🌐 Global Access
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
