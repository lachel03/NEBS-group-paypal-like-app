import { useState } from "react";
import api from "../api/axios";

export default function Register({ switchToLogin }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);

  // ===================== VALIDATION HELPERS =====================
  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return minLength && hasUppercase && hasNumber;
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateMobile = (mobile) => /^[0-9]{10,15}$/.test(mobile);

  // ===================== HANDLERS =====================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (status.message) setStatus({ message: "", type: "" });
  };

  const handleSubmit = async () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!validateEmail(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.mobileNumber) newErrors.mobileNumber = "Mobile number is required";
    else if (!validateMobile(formData.mobileNumber))
      newErrors.mobileNumber = "Invalid mobile number (10–15 digits)";

    if (!formData.password) newErrors.password = "Password is required";
    else if (!validatePassword(formData.password))
      newErrors.password =
        "Password must be at least 8 characters with 1 uppercase and 1 number";

    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      // ✅ Step 2: Send register request
      const payload = {
        full_name: formData.fullName,
        email: formData.email,
        mobile_number: formData.mobileNumber,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
      };

      const res = await api.post("/register", payload, {
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });

      console.log(res.data);
      setStatus({
        message: "Registration successful! Redirecting...",
        type: "success",
      });

      // Optional redirect
      setTimeout(() => switchToLogin(), 2000);
    } catch (error) {
      console.error("Registration error:", error);
      const msg =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      setStatus({ message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 1)
      return { strength: 25, label: "Weak", color: "bg-red-500" };
    if (strength === 2)
      return { strength: 50, label: "Fair", color: "bg-yellow-500" };
    if (strength === 3)
      return { strength: 75, label: "Good", color: "bg-blue-500" };
    return { strength: 100, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength();

  // ===================== UI =====================
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
        {/* LEFT SIDE */}
        <div className="flex flex-col justify-center text-white space-y-6 p-8">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              PALPAY BANKING
            </h1>
          </div>
          <div className="h-px bg-gradient-to-r from-cyan-500 to-transparent w-3/4"></div>
          <p className="text-2xl text-cyan-200 font-light leading-relaxed">
            Join the Future Today
          </p>
          <p className="text-lg text-slate-300 leading-relaxed">
            Create your account and unlock a world of seamless financial
            transactions. Experience banking reimagined with cutting-edge
            security and innovation.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <span className="px-4 py-2 bg-cyan-500 bg-opacity-20 border border-cyan-400 border-opacity-30 rounded-full text-cyan-300 text-sm">
              ✓ Quick Setup
            </span>
            <span className="px-4 py-2 bg-cyan-500 bg-opacity-20 border border-cyan-400 border-opacity-30 rounded-full text-cyan-300 text-sm">
              ✓ Verified Secure
            </span>
            <span className="px-4 py-2 bg-cyan-500 bg-opacity-20 border border-cyan-400 border-opacity-30 rounded-full text-cyan-300 text-sm">
              ✓ 24/7 Support
            </span>
          </div>
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="bg-slate-900 bg-opacity-60 backdrop-blur-xl border border-cyan-500 border-opacity-30 rounded-2xl p-8 shadow-2xl relative">
          <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-cyan-400 rounded-tl-2xl"></div>
          <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-cyan-400 rounded-br-2xl"></div>

          <div className="relative">
            <h1 className="text-3xl font-bold mb-2 text-cyan-400 tracking-wider">
              Get Started with Palpay
            </h1>
            <p className="text-cyan-300 text-sm mb-6 opacity-70">
              Join thousands of users making payments and managing money with
              confidence.
            </p>

            <div className="space-y-4">
              {/* FULL NAME */}
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className={`w-full pl-12 pr-4 py-3 bg-slate-800 bg-opacity-50 border ${
                    errors.fullName
                      ? "border-red-500"
                      : "border-cyan-500 border-opacity-30"
                  } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition`}
                />
                {errors.fullName && (
                  <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>
                )}
              </div>

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
                  placeholder="Email Address"
                  className={`w-full pl-12 pr-4 py-3 bg-slate-800 bg-opacity-50 border ${
                    errors.email
                      ? "border-red-500"
                      : "border-cyan-500 border-opacity-30"
                  } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition`}
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* MOBILE */}
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
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="Mobile Number"
                  className={`w-full pl-12 pr-4 py-3 bg-slate-800 bg-opacity-50 border ${
                    errors.mobileNumber
                      ? "border-red-500"
                      : "border-cyan-500 border-opacity-30"
                  } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition`}
                />
                {errors.mobileNumber && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.mobileNumber}
                  </p>
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
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {showPassword ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    )}
                  </svg>
                </button>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                )}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${passwordStrength.color} transition-all duration-300`}
                          style={{ width: `${passwordStrength.strength}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {passwordStrength.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* CONFIRM PASSWORD */}
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  className={`w-full pl-12 pr-12 py-3 bg-slate-800 bg-opacity-50 border ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-cyan-500 border-opacity-30"
                  } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition`}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400 hover:text-cyan-300"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {showConfirmPassword ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    )}
                  </svg>
                </button>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.confirmPassword}
                  </p>
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

              {/* SUBMIT BUTTON */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold py-3 rounded-lg shadow-lg shadow-cyan-500/50 transition transform ${
                  loading
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:scale-105 hover:shadow-cyan-400/60"
                }`}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>

              {/* LINK TO LOGIN */}
              <div className="flex justify-center items-center mt-6 text-sm">
                <span className="text-gray-400">Already have an account?</span>
                <button
                  type="button"
                  onClick={switchToLogin}
                  className="ml-2 text-cyan-400 hover:text-cyan-300 transition font-medium"
                >
                  Login here
                </button>
              </div>

              <div className="flex justify-center gap-2 mt-6">
                <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                <div className="w-2 h-2 rounded-full bg-cyan-500 opacity-50"></div>
                <div className="w-2 h-2 rounded-full bg-cyan-500 opacity-30"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
