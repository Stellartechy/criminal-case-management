import React, { useState } from "react";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import PoliceDashboard from "./components/PoliceDashboard";
import CourtDashboard from "./components/CourtDashboard";

function App() {
  const [role, setRole] = useState(null);

  // This function gets called after successful login
  const handleLogin = (userRole) => {
    setRole(userRole);
  };

  // If not logged in, show login page
  if (!role) {
    return <Login onLogin={handleLogin} />;
  }

  // Role-based navigation
  if (role === "admin") {
    return <AdminDashboard />;
  }
  if (role === "police") {
    return <PoliceDashboard />;
  }
  if (role === "court") {
    return <CourtDashboard />;
  }

  // Fallback if role is unknown
  return <h1>Unknown Role</h1>;
}

export default App;
