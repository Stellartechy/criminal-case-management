import React, { useState } from "react";
import axios from "axios";

function SignUp({ onBackToLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!username || !password) {
      setMessage("Please fill all fields.");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/users", {
        username,
        password,
        role,
      });

      if (response.data) {
        setMessage("Sign up successful! You can now login.");
        setUsername("");
        setPassword("");
        setRole("admin");
      }
    } catch (error) {
      console.error(error);
      setMessage("Error signing up. Username may already exist.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Sign Up</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          style={styles.input}
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <select
          style={styles.input}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="admin">Admin</option>
          <option value="police">Police Officer</option>
          <option value="court">Court Official</option>
        </select>
        <button style={styles.button} type="submit">
          Sign Up
        </button>
        <button
          style={{ ...styles.button, backgroundColor: "#888" }}
          type="button"
          onClick={onBackToLogin}
        >
          Back to Login
        </button>
        {message && <p style={styles.message}>{message}</p>}
      </form>
    </div>
  );
}

const styles = {
  container: {
    width: "350px",
    margin: "100px auto",
    padding: "30px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    boxShadow: "0px 0px 15px rgba(0,0,0,0.2)",
    backgroundColor: "#f7f7f7",
    textAlign: "center",
  },
  heading: {
    marginBottom: "20px",
    color: "#333",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "10px",
    margin: "10px 0",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  button: {
    padding: "10px",
    margin: "10px 0",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
  },
  message: {
    marginTop: "10px",
    color: "red",
  },
};

export default SignUp;
