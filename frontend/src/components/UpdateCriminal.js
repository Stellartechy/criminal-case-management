import React, { useState } from "react";

export default function UpdateCriminal() {
  const [id, setId] = useState("");
  const [form, setForm] = useState({ name: "", age: "", gender: "", address: "", status: "Under Trial" });

  const submit = async (e) => {
    e.preventDefault();
    if (!id) return alert("Enter criminal ID");
    try {
      const res = await fetch(`http://127.0.0.1:8000/criminals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, age: form.age ? Number(form.age) : null, gender: form.gender, address: form.address, status: form.status })
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) alert(body.message || "Criminal updated");
      else alert(body.detail || body.message || "Error");
    } catch (err) {
      console.error(err);
      alert("Error connecting");
    }
  };

  return (
    <div className="card">
      <h4>Update Criminal</h4>
      <form onSubmit={submit} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input placeholder="Criminal ID" value={id} onChange={(e) => setId(e.target.value)} />
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input type="number" placeholder="Age" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
        <input placeholder="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} />
        <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="Under Trial">Under Trial</option>
          <option value="Released">Released</option>
          <option value="Convicted">Convicted</option>
        </select>
        <button type="submit">Update</button>
      </form>
    </div>
  );
}
