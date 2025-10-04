import React, { useState } from "react";

export default function DeleteOperator() {
  const [id, setId] = useState("");

  const handle = async () => {
    if (!id) return alert("Enter user ID");
    try {
      const res = await fetch(`http://127.0.0.1:8000/users/${id}`, { method: "DELETE" });
      const body = await res.json().catch(() => ({}));
      if (res.ok) alert(body.message || "Deleted");
      else alert(body.detail || body.message || "Error");
    } catch (err) {
      console.error(err);
      alert("Error connecting");
    }
  };

  return (
    <div className="card">
      <h4>Delete Operator</h4>
      <div style={{ display: "flex", gap: 8 }}>
        <input placeholder="User ID" value={id} onChange={(e) => setId(e.target.value)} />
        <button onClick={handle}>Delete</button>
      </div>
    </div>
  );
}
