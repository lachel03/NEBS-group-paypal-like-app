import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Logs from "./pages/Logs";
import api from "./api/axios";

// One-per-tab CSRF bootstrap
let csrfBootstrapped = false;
async function ensureCsrf() {
  if (csrfBootstrapped) return;
  await api.get("/sanctum/csrf-cookie");
  csrfBootstrapped = true;
}

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState("login");
  const [booting, setBooting] = useState(true);

  // On mount: ensure CSRF + try session restore (/user)
  useEffect(() => {
    (async () => {
      try {
        await ensureCsrf();
        const { data } = await api.get("/user"); // succeeds if session cookie is valid
        setUser(data);
        setCurrentPage("dashboard");
      } catch {
        // not logged in (or session expired)
        setUser(null);
        setCurrentPage("login");
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  // When login succeeds (Login page will POST /login)
  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setCurrentPage("dashboard");
  };

  // When registration succeeds (Register page will POST /register)
  const handleRegisterSuccess = () => {
    setCurrentPage("login");
  };

  // Logout (session mode)
  const handleLogout = async () => {
    try {
      await ensureCsrf();
      await api.post("/logout");
    } catch (e) {
      console.warn("Logout failed (ignored):", e?.message);
    } finally {
      setUser(null);
      setCurrentPage("login");
    }
  };

  // Local toggle to reflect 2FA status after API calls in Dashboard
  const handleToggle2FA = (enabled) => {
    setUser((prev) => (prev ? { ...prev, two_factor_enabled: enabled } : prev));
  };

  if (booting) {
    // optional: replace with your spinner/skeleton
    return null;
  }

	return (
	  <>
		{currentPage === "login" && !user && (
		  <Login
			switchToRegister={() => setCurrentPage("register")}
			onLoginSuccess={handleLoginSuccess}
			ensureCsrf={ensureCsrf}
		  />
		)}

		{currentPage === "register" && (
		  <Register switchToLogin={handleRegisterSuccess} ensureCsrf={ensureCsrf} />
		)}

		{currentPage === "dashboard" && user && (
		  <Dashboard
			user={user}
			onLogout={handleLogout}
			onToggle2FA={handleToggle2FA}
			ensureCsrf={ensureCsrf}
			// NEW: navigate to logs
			onViewLogs={() => setCurrentPage("logs")}
		  />
		)}

		{currentPage === "logs" && user && (
		  <Logs
			ensureCsrf={ensureCsrf}
			onBack={() => setCurrentPage("dashboard")}
		  />
		)}
	  </>
);
}

export default App;
