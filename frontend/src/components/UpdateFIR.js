import React, { useState } from "react";

export default function UpdateFIR() {
  const [caseId, setCaseId] = useState("");
  const [form, setForm] = useState({ case_status: "Open", case_date: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caseId) return alert("Enter Case ID");
    try {
      const res = await fetch(`http://127.0.0.1:8000/cases/${caseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        alert(body.message || "Case updated");
      } else {
        alert(body.detail || body.message || "Error updating case");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
    }
  };

  return (
    <div className="card">
      <h4>Update FIR</h4>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input placeholder="Case ID" value={caseId} onChange={(e) => setCaseId(e.target.value)} />
        <input type="date" value={form.case_date} onChange={(e) => setForm({ ...form, case_date: e.target.value })} />
        <select value={form.case_status} onChange={(e) => setForm({ ...form, case_status: e.target.value })}>
          <option value="Open">Open</option>
          <option value="In Court">In Court</option>
          <option value="Closed">Closed</option>
        </select>
        <button type="submit">Update</button>
      </form>
    </div>
  );
}
