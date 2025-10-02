import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const navigate = useNavigate(); // For redirection
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");

  const handleLogin = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });
      const data = await res.json();

      if (res.ok) {
        alert(`Login successful! Role: ${data.role}`);

        // Role-based redirection
        if (data.role === "admin") navigate("/dashboard/admin");
        else if (data.role === "police") navigate("/dashboard/police");
        else if (data.role === "court") navigate("/dashboard/court");
      } else {
        alert(data.detail);
      }
    } catch (err) {
      alert("Login failed. Check backend or network.");
    }
  };

  const handleSignUp = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Sign up successful! Now login.");
        setIsLogin(true);
      } else {
        alert("Sign up failed.");
      }
    } catch (err) {
      alert("Error connecting to backend.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-400 to-purple-600">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? "Login" : "Sign Up"}
        </h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 mb-4 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border rounded"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-3 mb-4 border rounded"
        >
          <option value="admin">Admin</option>
          <option value="police">Police Officer</option>
          <option value="court">Court Official</option>
        </select>

        <button
          onClick={isLogin ? handleLogin : handleSignUp}
          className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          {isLogin ? "Login" : "Sign Up"}
        </button>

        <p
          className="mt-4 text-center text-sm text-gray-500 cursor-pointer hover:underline"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
}
