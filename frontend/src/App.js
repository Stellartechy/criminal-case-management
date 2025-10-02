import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import AdminDashboard from "./components/AdminDashboard";
import PoliceDashboard from "./components/PoliceDashboard";
import CourtDashboard from "./components/CourtDashboard";

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  return (
    <Router>
      <Routes>
        {/* Default route → Login */}
        <Route path="/" element={user ? <Navigate to={`/${user.role}`} /> : <Login onLogin={handleLogin} />} />

        {/* Signup page */}
        <Route path="/signup" element={<SignUp />} />

        {/* Dashboards */}
        <Route path="/admin" element={user?.role === "admin" ? <AdminDashboard /> : <Navigate to="/" />} />
        <Route path="/police" element={user?.role === "police" ? <PoliceDashboard /> : <Navigate to="/" />} />
        <Route path="/court" element={user?.role === "court" ? <CourtDashboard /> : <Navigate to="/" />} />

        {/* Catch-all → redirect to login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
