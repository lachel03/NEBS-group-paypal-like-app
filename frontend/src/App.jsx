import Login from './pages/Login';
import Register from "./pages/Register";
import Dashboard from './pages/Dashboard';
import { useState } from "react";


function App() {
  const [user, setUser] = useState(null); 
  const [currentPage, setCurrentPage] = useState("login"); 

  const handleLogin = () => {
    // Real login logic
    setUser({
      full_name: 'Lance Elane',
      email: 'lance@example.com',
      mobile_number: '+639123456789',
      two_factor_enabled: false,
      is_verified: true,
      last_login_at: '2025-01-15 14:30:22',
      last_login_ip: '192.168.1.100',
      created_at: '2024-06-15'
    });
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage("login");
  };

  const handleToggle2FA = (status) => {
    setUser(prev => ({ ...prev, two_factor_enabled: status }));
  };

  const handleRegister = (data) => {
    console.log("Registered user:", data);
    alert("Registered successfully!");
    setCurrentPage("login"); 
  };

  if (user) {
    return (
      <Dashboard
        user={user}
        onLogout={handleLogout}
        onToggle2FA={handleToggle2FA}
      />
    );
  }

  if (currentPage === "login") {
    return (
      <Login
        onLogin={handleLogin}
        switchToRegister={() => setCurrentPage("register")}
      />
    );
  }

  return (
    <Register
      onRegister={handleRegister}
      switchToLogin={() => setCurrentPage("login")}
    />
  );
}

export default App;
