import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import api from "./api/axios";

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState("login");

  // ✅ On mount: check if already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      setCurrentPage("dashboard");
    }
  }, []);

  // ✅ When login succeeds
  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setCurrentPage("dashboard");
  };

  // ✅ When registration succeeds
  const handleRegisterSuccess = () => {
    setCurrentPage("login");
  };

  // ✅ Handle logout (with backend sync)
  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (e) {
      console.warn("Logout failed (ignored):", e.message);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setCurrentPage("login");
    }
  };

  // ✅ Toggle 2FA locally for Dashboard
  const handleToggle2FA = (enabled) => {
    setUser((prev) => ({ ...prev, two_factor_enabled: enabled }));
  };

  // ✅ Render logic
  return (
    <>
      {currentPage === "login" && !user && (
        <Login
          switchToRegister={() => setCurrentPage("register")}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {currentPage === "register" && (
        <Register switchToLogin={handleRegisterSuccess} />
      )}

      {currentPage === "dashboard" && user && (
        <Dashboard
          user={user}
          onLogout={handleLogout}
          onToggle2FA={handleToggle2FA}
        />
      )}
    </>
  );
}

export default App;
