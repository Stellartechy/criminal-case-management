import React, { useState } from "react";

function getListFromRes(body) {
  if (!body) return [];
  if (Array.isArray(body)) return body;
  return body.data ?? body;
}

export default function RegisterFIR({ currentUser }) {
  const [form, setForm] = useState({
    criminal_id: "",
    officer_id: currentUser?.user_id ?? "",
    case_status: "Open",
    case_date: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:8000/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          criminal_id: form.criminal_id ? Number(form.criminal_id) : null,
          officer_id: form.officer_id ? Number(form.officer_id) : null,
          case_status: form.case_status,
          case_date: form.case_date || null,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        alert(body.message || "FIR registered");
        setForm({ criminal_id: "", officer_id: currentUser?.user_id ?? "", case_status: "Open", case_date: "" });
      } else {
        alert(body.detail || body.message || "Error registering case");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
    }
  };

  return (
    <div className="card">
      <h4>Register New FIR</h4>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input name="criminal_id" value={form.criminal_id} onChange={handleChange} placeholder="Criminal ID" />
        <input name="officer_id" value={form.officer_id} onChange={handleChange} placeholder="Officer ID" />
        <input name="case_date" type="date" value={form.case_date} onChange={handleChange} />
        <select name="case_status" value={form.case_status} onChange={handleChange}>
          <option value="Open">Open</option>
          <option value="In Court">In Court</option>
          <option value="Closed">Closed</option>
        </select>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
