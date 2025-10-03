import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignUp.css";

function SignUp() {
  const navigate = useNavigate();
  const [role, setRole] = useState("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rankTitle, setRankTitle] = useState(""); // police only
  const [station, setStation] = useState(""); // police only
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = { username, password, role };

    if (role === "admin") {
      payload.name = name; // admin department/person name
    } else if (role === "police") {
      payload.name = name;
      payload.rank_title = rankTitle;
      payload.station = station;
    }

    try {
      const res = await fetch("http://localhost:8000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Signup successful! Please login.");
        navigate("/"); // redirect to login page
      } else {
        alert(data.detail || "Signup failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit} className="signup-form">
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="admin">Admin</option>
          <option value="police">Police Officer</option>
        </select>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder={role === "police" ? "Officer Name" : "Admin Name"}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {role === "police" && (
          <>
            <input
              type="text"
              placeholder="Rank/Title"
              value={rankTitle}
              onChange={(e) => setRankTitle(e.target.value)}
            />
            <input
              type="text"
              placeholder="Station"
              value={station}
              onChange={(e) => setStation(e.target.value)}
            />
          </>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
      <p>
        Already have an account?{" "}
        <button
          type="button"
          className="switch-btn"
          onClick={() => navigate("/")}
        >
          Login
        </button>
      </p>
    </div>
  );
}

export default SignUp;
