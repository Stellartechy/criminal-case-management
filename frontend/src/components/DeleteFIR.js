import React, { useState } from "react";

export default function DeleteFIR() {
  const [caseId, setCaseId] = useState("");

  const handleDelete = async () => {
    if (!caseId) return alert("Enter Case ID");
    try {
      const res = await fetch(`http://127.0.0.1:8000/cases/${caseId}`, { method: "DELETE" });
      const body = await res.json().catch(() => ({}));
      if (res.ok) alert(body.message || "Case deleted");
      else alert(body.detail || body.message || "Error deleting");
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
    }
  };

  return (
    <div className="card">
      <h4>Delete FIR</h4>
      <div style={{ display: "flex", gap: 10 }}>
        <input placeholder="Case ID" value={caseId} onChange={(e) => setCaseId(e.target.value)} />
        <button onClick={handleDelete}>Delete</button>
      </div>
    </div>
  );
}
