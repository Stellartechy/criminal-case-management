import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import AdminDashboard from "./components/AdminDashboard";
import PoliceDashboard from "./components/PoliceDashboard";
import CourtDashboard from "./components/CourtDashboard";

function App() {
  const [user, setUser] = useState(null);

  // Callback when login is successful
  const handleLogin = (userData) => {
    setUser(userData);
  };

  return (
    <Router>
      <Routes>
        {/* Default route → Login */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate to={`/${user.role}`} replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />

        {/* Signup page */}
        <Route
          path="/signup"
          element={<SignUp />}
        />

        {/* Admin dashboard route */}
        <Route
          path="/admin"
          element={
            user?.role === "admin" ? (
              <AdminDashboard user={user} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Police dashboard route */}
        <Route
          path="/police"
          element={
            user?.role === "police" ? (
              <PoliceDashboard user={user} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Court dashboard route */}
        <Route
          path="/court"
          element={
            user?.role === "court" ? (
              <CourtDashboard user={user} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Catch-all route → redirect to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
