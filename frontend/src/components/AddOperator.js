import React, { useState } from "react";

export default function AddOperator() {
  const [form, setForm] = useState({ username: "", password: "", role: "police" });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:8000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        alert(body.message || "Operator added");
        setForm({ username: "", password: "", role: "police" });
      } else {
        alert(body.detail || body.message || "Error");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting");
    }
  };

  return (
    <div className="card">
      <h4>Add Operator</h4>
      <form onSubmit={submit} style={{ display: "flex", gap: 8 }}>
        <input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <input placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="admin">Admin</option>
          <option value="police">Police</option>
          <option value="court">Court</option>
        </select>
        <button type="submit">Add</button>
      </form>
    </div>
  );
}
