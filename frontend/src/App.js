import React, { useState } from "react";
import Login from "./components/Login";
import SignUp from "./components/SignUp";

// Import your dashboards
import AdminDashboard from "./components/AdminDashboard";
import PoliceDashboard from "./components/PoliceDashboard";
import CourtDashboard from "./components/CourtDashboard";

function App() {
  const [showSignUp, setShowSignUp] = useState(false); // toggle login/signup
  const [user, setUser] = useState(null); // store logged-in user

  const handleSignUpClick = () => {
    setShowSignUp(true);
  };

  const handleLoginClick = () => {
    setShowSignUp(false);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  // Render dashboards based on role
  if (user) {
    switch (user.role) {
      case "admin":
        return <AdminDashboard user={user} />;
      case "police":
        return <PoliceDashboard user={user} />;
      case "court":
        return <CourtDashboard user={user} />;
      default:
        return (
          <div style={{ textAlign: "center", marginTop: "100px" }}>
            <h1>Welcome, {user.username}!</h1>
            <p>Your role: {user.role}</p>
          </div>
        );
    }
  }

  // Render Login or SignUp page
  return (
    <div>
      {showSignUp ? (
        <SignUp onLoginClick={handleLoginClick} />
      ) : (
        <Login
          onSignUpClick={handleSignUpClick}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}

export default App;
