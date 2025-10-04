import React, { useState } from "react";

function getList(body) {
  if (!body) return [];
  if (Array.isArray(body)) return body;
  return body.data ?? body;
}

export default function ViewOperator() {
  const [users, setUsers] = useState([]);

  const load = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/users");
      const body = await res.json().catch(() => null);
      setUsers(getList(body) || []);
    } catch (err) {
      console.error(err);
      alert("Error loading users");
    }
  };

  return (
    <div className="card">
      <h4>Operators</h4>
      <button onClick={load}>Load Operators</button>
      <table>
        <thead><tr><th>ID</th><th>Username</th><th>Role</th></tr></thead>
        <tbody>
          {users.length ? users.map(u => (<tr key={u.user_id ?? u.id}><td>{u.user_id ?? u.id}</td><td>{u.username}</td><td>{u.role}</td></tr>)) : <tr><td colSpan="3">No operators</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
