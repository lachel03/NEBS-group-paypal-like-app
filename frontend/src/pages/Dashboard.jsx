import { useState } from "react";
import api from "../api/axios";

export default function Dashboard({ user, onLogout, onToggle2FA, onSendMoney, onRequestMoney, ensureCsrf, onViewLogs }) {
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    user?.two_factor_enabled || false
  );
  const [activeTab, setActiveTab] = useState("overview");

  // 2FA modal state
  const [twoFAStage, setTwoFAStage] = useState("prompt"); // 'prompt' | 'setup' | 'verify' | 'disable'
  const [qrDataUri, setQrDataUri] = useState("");
  const [otp, setOtp] = useState("");
  const [twoFAStatus, setTwoFAStatus] = useState({ message: "", type: "" });
  const [twoFALoading, setTwoFALoading] = useState(false);

  // Money modals
  const [sendForm, setSendForm] = useState({
    recipient: "",
    amount: "",
    note: "",
  });
  const [receiveAmount, setReceiveAmount] = useState("");

  // User Data (still mocked for balances etc.)
  const accountInfo = {
    fullName: user?.full_name || "Loading...",
    email: user?.email || "Loading...",
    mobileNumber: user?.mobile_number || "Loading...",
    accountNumber: "Example Number",
    balance: "Example Balance",
    isVerified: user?.is_verified ?? true,
    twoFactorEnabled: twoFactorEnabled,
    lastLogin: user?.last_login_at_fmt || user?.last_login_at || "Loading...",
    lastLoginIp: user?.last_login_ip || "Loading...",
    lastLoginBrowser: user?.last_login_browser || "Loading...",
    accountCreated: user?.created_at_fmt || user?.created_at || "Loading...",
  };

  // Example transactions (static for now)
  const transactions = [
    { id: 1, type: "receive", amount: "₱100.00", recipient: "Rein Santos", sender: "Example Sender", note: "Example Receiving Money", timestamp: "2025-01-20 10:30:15", status: "completed" },
    { id: 2, type: "send", amount: "₱100.00", recipient: "Example Recipient", sender: "You", note: "Example Sending Money", timestamp: "2025-01-19 18:45:30", status: "completed" },
  ];

  // ----- 2FA handlers -----
  const handleToggle2FA = () => {
    setTwoFAStatus({ message: "", type: "" });
    setOtp("");
    setQrDataUri("");
    // If currently disabled → ask to enable; if enabled → ask to disable
    setTwoFAStage(twoFactorEnabled ? "disable" : "prompt");
    setShow2FAModal(true);
  };

  // Begin 2FA setup (fetch QR)
  const start2FASetup = async () => {
    try {
      setTwoFALoading(true);
      setTwoFAStatus({ message: "", type: "" });
      if (ensureCsrf) await ensureCsrf();

      const { data } = await api.post("/2fa/setup", {}, { headers: { "X-Requested-With": "XMLHttpRequest" } });
      setQrDataUri(data.qr_code);
      setTwoFAStage("setup"); // show QR + OTP entry
    } catch (error) {
      const msg = error.response?.data?.message || "Could not start 2FA setup.";
      setTwoFAStatus({ message: msg, type: "error" });
    } finally {
      setTwoFALoading(false);
    }
  };

  // Verify 2FA (enable)
  const verify2FA = async () => {
    if (!otp.trim()) {
      setTwoFAStatus({ message: "Please enter the 6-digit code.", type: "error" });
      return;
    }
    try {
      setTwoFALoading(true);
      setTwoFAStatus({ message: "", type: "" });
      if (ensureCsrf) await ensureCsrf();

      await api.post("/2fa/verify", { otp }, { headers: { "X-Requested-With": "XMLHttpRequest" } });
      setTwoFAStatus({ message: "Two-factor authentication enabled!", type: "success" });
      setTwoFactorEnabled(true);
      onToggle2FA?.(true);
      // Close modal shortly after success
      setTimeout(() => {
        setShow2FAModal(false);
        setOtp("");
        setQrDataUri("");
        setTwoFAStage("prompt");
      }, 900);
    } catch (error) {
      const msg = error.response?.data?.message || "Invalid code. Please try again.";
      setTwoFAStatus({ message: msg, type: "error" });
    } finally {
      setTwoFALoading(false);
    }
  };

  // Disable 2FA
  const disable2FA = async () => {
    if (!otp.trim()) {
      setTwoFAStatus({ message: "Please enter your 6-digit code to disable.", type: "error" });
      return;
    }
    try {
      setTwoFALoading(true);
      setTwoFAStatus({ message: "", type: "" });
      if (ensureCsrf) await ensureCsrf();

      await api.post("/2fa/disable", { otp }, { headers: { "X-Requested-With": "XMLHttpRequest" } });
      setTwoFAStatus({ message: "Two-factor authentication disabled.", type: "success" });
      setTwoFactorEnabled(false);
      onToggle2FA?.(false);
      setTimeout(() => {
        setShow2FAModal(false);
        setOtp("");
        setQrDataUri("");
        setTwoFAStage("prompt");
      }, 800);
    } catch (error) {
      const msg = error.response?.data?.message || "Could not disable 2FA. Check your code and try again.";
      setTwoFAStatus({ message: msg, type: "error" });
    } finally {
      setTwoFALoading(false);
    }
  };

  // ----- Money actions (UI only for now) -----
  const handleSendMoney = () => {
    if (sendForm.recipient && sendForm.amount) {
      onSendMoney?.(sendForm);
      setSendForm({ recipient: "", amount: "", note: "" });
      setShowSendModal(false);
    }
  };

  const handleRequestMoney = () => {
    if (receiveAmount) {
      onRequestMoney?.({ amount: receiveAmount });
      setReceiveAmount("");
      setShowReceiveModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* BG blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-cyan-500 rounded-full blur-3xl opacity-10 top-0 left-1/4 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-10 bottom-0 right-1/4 animate-pulse" style={{ animationDelay: "1.5s" }}></div>
      </div>

      {/* NAV */}
      <nav className="relative z-10 bg-slate-900 bg-opacity-60 backdrop-blur-xl border-b border-cyan-500 border-opacity-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                PALPAY BANKING
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex space-x-2">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-4 py-2 rounded-lg transition ${
                    activeTab === "overview"
                      ? "bg-cyan-500 bg-opacity-20 text-cyan-400 border border-cyan-400 border-opacity-30"
                      : "text-gray-400 hover:text-cyan-400"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("transactions")}
                  className={`px-4 py-2 rounded-lg transition ${
                    activeTab === "transactions"
                      ? "bg-cyan-500 bg-opacity-20 text-cyan-400 border border-cyan-400 border-opacity-30"
                      : "text-gray-400 hover:text-cyan-400"
                  }`}
                >
                  Transactions
                </button>
              </div>
			  
				<button
				  onClick={onViewLogs}
				  className="hidden md:flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 border border-cyan-400 border-opacity-30 rounded-lg text-cyan-300 transition">
				  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
				  </svg>
				  <span>View Login Logs</span>
				</button>

              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 bg-opacity-20 border border-red-400 border-opacity-30 rounded-lg text-red-400 hover:bg-opacity-30 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
			  
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {accountInfo.fullName}!</h2>
          <p className="text-cyan-300">Manage your account and view your financial overview.</p>
        </div>

        {/* Balance / Actions */}
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-8 mb-8 shadow-2xl shadow-cyan-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="relative">
            <p className="text-cyan-100 text-sm mb-2">Total Balance</p>
            <h3 className="text-5xl font-bold text-white mb-6">{accountInfo.balance}</h3>

            <div className="flex flex-wrap gap-4 mb-4">
              <button
                onClick={() => setShowSendModal(true)}
                className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm px-6 py-3 rounded-lg transition transform hover:scale-105"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span className="text-white font-semibold">Send Money</span>
              </button>

              <button
                onClick={() => setShowReceiveModal(true)}
                className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm px-6 py-3 rounded-lg transition transform hover:scale-105"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                <span className="text-white font-semibold">Request Money</span>
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <div>
                <p className="text-cyan-100 text-xs">Account Number</p>
                <p className="text-white font-mono">{accountInfo.accountNumber}</p>
              </div>
              <div className="flex-1"></div>
              {accountInfo.isVerified && (
                <div className="flex items-center space-x-1 bg-green-500 bg-opacity-20 px-3 py-1 rounded-full">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-400 text-sm">Verified</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {activeTab === "overview" && (
          <div>
            {/* Info + 2FA cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Account Info */}
              <div className="bg-slate-900 bg-opacity-60 backdrop-blur-xl border border-cyan-500 border-opacity-30 rounded-2xl p-6 shadow-xl relative">
                <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-cyan-400 rounded-tl-2xl opacity-50"></div>

                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-cyan-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-cyan-400">Account Information</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-cyan-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-gray-400 text-sm">Full Name</p>
                      <p className="text-white font-medium">{accountInfo.fullName}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-cyan-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-gray-400 text-sm">Email Address</p>
                      <p className="text-white font-medium">{accountInfo.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-cyan-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-gray-400 text-sm">Mobile Number</p>
                      <p className="text-white font-medium">{accountInfo.mobileNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-cyan-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-gray-400 text-sm">Member Since</p>
                      <p className="text-white font-medium">{accountInfo.accountCreated}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2FA Card */}
              <div className="bg-slate-900 bg-opacity-60 backdrop-blur-xl border border-cyan-500 border-opacity-30 rounded-2xl p-6 shadow-xl relative">
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyan-400 rounded-br-2xl opacity-50"></div>

                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-cyan-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-cyan-400">Two-Factor Authentication</h3>
                </div>

                <div className="mb-6">
                  <div
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      twoFactorEnabled
                        ? "bg-green-500 bg-opacity-10 border border-green-400 border-opacity-30"
                        : "bg-red-500 bg-opacity-10 border border-red-400 border-opacity-30"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          twoFactorEnabled ? "bg-green-500 bg-opacity-20" : "bg-red-500 bg-opacity-20"
                        }`}
                      >
                        {twoFactorEnabled ? (
                          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className={`font-semibold ${twoFactorEnabled ? "text-green-400" : "text-red-400"}`}>
                          {twoFactorEnabled ? "Enabled" : "Disabled"}
                        </p>
                        <p className="text-gray-400 text-sm">2FA Status</p>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-300 text-sm mb-4">
                  {twoFactorEnabled
                    ? "Your account is protected with two-factor authentication. You'll need to enter a code from your authenticator app when logging in."
                    : "Enhance your account security by enabling two-factor authentication. This adds an extra layer of protection to your account."}
                </p>

                <button
                  onClick={handleToggle2FA}
                  className={`w-full py-3 rounded-lg font-semibold transition transform hover:scale-105 ${
                    twoFactorEnabled
                      ? "bg-red-500 bg-opacity-20 border border-red-400 border-opacity-30 text-red-400 hover:bg-opacity-30"
                      : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/50"
                  }`}
                >
                  {twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
                </button>
              </div>
            </div>

            {/* Security quick stats */}
            <div className="bg-slate-900 bg-opacity-60 backdrop-blur-xl border border-cyan-500 border-opacity-30 rounded-2xl p-6 shadow-xl relative">
              <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-cyan-400 rounded-tr-2xl opacity-50"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-cyan-400 rounded-bl-2xl opacity-50"></div>

              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-cyan-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-cyan-400">Account Security</h3>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-slate-800 bg-opacity-40 rounded-lg p-4 border border-cyan-500 border-opacity-20">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-400 text-sm">Last Login</p>
                  </div>
                  <p className="text-white font-medium">{accountInfo.lastLogin}</p>
                </div>

                <div className="bg-slate-800 bg-opacity-40 rounded-lg p-4 border border-cyan-500 border-opacity-20">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <p className="text-gray-400 text-sm">IP Address</p>
                  </div>
                  <p className="text-white font-medium font-mono">{accountInfo.lastLoginIp}</p>
                </div>

                <div className="bg-slate-800 bg-opacity-40 rounded-lg p-4 border border-cyan-500 border-opacity-20">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-400 text-sm">Browser</p>
                  </div>
                  <p className="text-white font-medium text-sm">{accountInfo.lastLoginBrowser}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "transactions" && (
          <div className="bg-slate-900 bg-opacity-60 backdrop-blur-xl border border-cyan-500 border-opacity-30 rounded-2xl p-6 shadow-xl relative">
            <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-cyan-400 rounded-tl-2xl opacity-50"></div>
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-cyan-400 rounded-br-2xl opacity-50"></div>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-cyan-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-cyan-400">Transaction History Example</h3>
            </div>

            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-slate-800 bg-opacity-40 rounded-lg p-4 border border-cyan-500 border-opacity-20 hover:border-opacity-40 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          transaction.type === "receive" ? "bg-green-500 bg-opacity-20" : "bg-blue-500 bg-opacity-20"
                        }`}
                      >
                        {transaction.type === "receive" ? (
                          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-white font-semibold">
                            {transaction.type === "receive" ? transaction.sender : transaction.recipient}
                          </p>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              transaction.status === "completed"
                                ? "bg-green-500 bg-opacity-20 text-green-400"
                                : "bg-yellow-500 bg-opacity-20 text-yellow-400"
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">{transaction.note}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-gray-500 text-xs">{transaction.timestamp}</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-lg font-bold ${transaction.type === "receive" ? "text-green-400" : "text-blue-400"}`}>
                        {transaction.type === "receive" ? "+" : "-"}
                        {transaction.amount}
                      </p>
                      <p className="text-gray-400 text-xs capitalize">{transaction.type}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {transactions.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-400">No transactions yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Send Money Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-cyan-500 border-opacity-30 rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-cyan-400 rounded-tl-2xl"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyan-400 rounded-br-2xl"></div>

            <div className="relative">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-cyan-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-cyan-400">Send Money</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Recipient Email or Mobile</label>
                  <input
                    type="text"
                    value={sendForm.recipient}
                    onChange={(e) => setSendForm({ ...sendForm, recipient: e.target.value })}
                    placeholder="email@example.com or +639123456789"
                    className="w-full px-4 py-3 bg-slate-800 bg-opacity-50 border border-cyan-500 border-opacity-30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  />
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 font-semibold">₱</span>
                    <input
                      type="number"
                      value={sendForm.amount}
                      onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-3 bg-slate-800 bg-opacity-50 border border-cyan-500 border-opacity-30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Note (Optional)</label>
                  <input
                    type="text"
                    value={sendForm.note}
                    onChange={(e) => setSendForm({ ...sendForm, note: e.target.value })}
                    placeholder="What's this for?"
                    className="w-full px-4 py-3 bg-slate-800 bg-opacity-50 border border-cyan-500 border-opacity-30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  />
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button onClick={() => setShowSendModal(false)} className="flex-1 py-3 bg-slate-800 border border-gray-600 rounded-lg text-white hover:bg-slate-700 transition">
                  Cancel
                </button>
                <button onClick={handleSendMoney} className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg font-semibold transition">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Money Modal */}
      {showReceiveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-cyan-500 border-opacity-30 rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-cyan-400 rounded-tl-2xl"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyan-400 rounded-br-2xl"></div>

            <div className="relative">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-cyan-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-cyan-400">Request Money</h3>
              </div>

              <p className="text-gray-300 mb-4 text-sm">
                Generate a payment request link to share with others. They can use this link to send you money easily.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Amount to Request</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 font-semibold">₱</span>
                    <input
                      type="number"
                      value={receiveAmount}
                      onChange={(e) => setReceiveAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-3 bg-slate-800 bg-opacity-50 border border-cyan-500 border-opacity-30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                    />
                  </div>
                </div>

                <div className="bg-cyan-500 bg-opacity-10 border border-cyan-400 border-opacity-30 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <svg className="w-5 h-5 text-cyan-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-cyan-300 text-sm">
                      A payment link will be generated that you can share via email, SMS, or social media.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button onClick={() => setShowReceiveModal(false)} className="flex-1 py-3 bg-slate-800 border border-gray-600 rounded-lg text-white hover:bg-slate-700 transition">
                  Cancel
                </button>
                <button onClick={handleRequestMoney} className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg font-semibold transition">
                  Generate Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-cyan-500 border-opacity-30 rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-cyan-400 rounded-tl-2xl"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyan-400 rounded-br-2xl"></div>

            <div className="relative">
              {/* Header */}
              <h3 className="text-2xl font-bold text-cyan-400 mb-4">
                {twoFactorEnabled ? "Disable Two-Factor Authentication" : twoFAStage === "setup" ? "Scan QR & Enter Code" : "Enable Two-Factor Authentication"}
              </h3>

              {/* Prompt (if enabling) */}
              {!twoFactorEnabled && twoFAStage === "prompt" && (
                <>
                  <p className="text-gray-300 mb-6">
                    Enable two-factor authentication to add an extra layer of security. You’ll scan a QR code with your authenticator app, then enter the 6-digit code.
                  </p>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setShow2FAModal(false)}
                      className="flex-1 py-3 bg-slate-800 border border-gray-600 rounded-lg text-white hover:bg-slate-700 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={start2FASetup}
                      className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg font-semibold transition"
                      disabled={twoFALoading}
                    >
                      {twoFALoading ? "Preparing..." : "Start Setup"}
                    </button>
                  </div>
                </>
              )}

              {/* Setup view (QR + OTP) */}
              {!twoFactorEnabled && twoFAStage === "setup" && (
                <>
                  <p className="text-gray-300 mb-4">
                    Scan this QR in Google Authenticator (or any TOTP app), then enter the 6-digit code to activate 2FA.
                  </p>

                  <div className="flex items-center justify-center mb-4">
                    {qrDataUri ? (
                      <img src={qrDataUri} alt="2FA QR" className="w-48 h-48 rounded-lg border border-cyan-500 border-opacity-30" />
                    ) : (
                      <div className="w-48 h-48 rounded-lg border border-cyan-500 border-opacity-30 flex items-center justify-center text-cyan-300">
                        Loading QR…
                      </div>
                    )}
                  </div>

                  <div className="relative mb-4">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit code"
                      inputMode="numeric"
                      maxLength={6}
                      className="w-full pl-12 pr-4 py-3 bg-slate-800 bg-opacity-50 border border-cyan-500 border-opacity-30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition tracking-widest"
                    />
                  </div>

                  {twoFAStatus.message && (
                    <p className={`text-sm mb-3 ${twoFAStatus.type === "success" ? "text-green-400" : "text-red-400"}`}>
                      {twoFAStatus.message}
                    </p>
                  )}

                  <div className="flex space-x-4">
                    <button
                      onClick={() => {
                        setShow2FAModal(false);
                        setOtp("");
                        setQrDataUri("");
                        setTwoFAStage("prompt");
                      }}
                      className="flex-1 py-3 bg-slate-800 border border-gray-600 rounded-lg text-white hover:bg-slate-700 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={verify2FA}
                      className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg font-semibold transition"
                      disabled={twoFALoading}
                    >
                      {twoFALoading ? "Verifying..." : "Verify & Enable"}
                    </button>
                  </div>
                </>
              )}

              {/* Disable view */}
              {twoFactorEnabled && twoFAStage === "disable" && (
                <>
                  <p className="text-gray-300 mb-6">
                    Enter a current code from your authenticator app to disable two-factor authentication. This will make your account less secure.
                  </p>

                  <div className="relative mb-4">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit code"
                      inputMode="numeric"
                      maxLength={6}
                      className="w-full pl-12 pr-4 py-3 bg-slate-800 bg-opacity-50 border border-red-400 border-opacity-30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition tracking-widest"
                    />
                  </div>

                  {twoFAStatus.message && (
                    <p className={`text-sm mb-3 ${twoFAStatus.type === "success" ? "text-green-400" : "text-red-400"}`}>
                      {twoFAStatus.message}
                    </p>
                  )}

                  <div className="flex space-x-4">
                    <button
                      onClick={() => {
                        setShow2FAModal(false);
                        setOtp("");
                        setTwoFAStage("prompt");
                      }}
                      className="flex-1 py-3 bg-slate-800 border border-gray-600 rounded-lg text-white hover:bg-slate-700 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={disable2FA}
                      className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold transition"
                      disabled={twoFALoading}
                    >
                      {twoFALoading ? "Disabling..." : "Disable 2FA"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
