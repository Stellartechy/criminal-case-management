import React, { useState } from "react";

function getList(body) {
  if (!body) return [];
  if (Array.isArray(body)) return body;
  return body.data ?? body;
}

export default function RetrieveCriminal() {
  const [list, setList] = useState([]);

  const load = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/criminals");
      const body = await res.json().catch(() => null);
      setList(getList(body) || []);
    } catch (err) {
      console.error(err);
      alert("Error loading criminals");
    }
  };

  return (
    <div className="card">
      <h4>Criminals</h4>
      <button onClick={load}>Load</button>
      <table>
        <thead><tr><th>ID</th><th>Name</th><th>Age</th><th>Gender</th><th>Address</th><th>Status</th></tr></thead>
        <tbody>
          {list.length ? list.map(c => (
            <tr key={c.criminal_id ?? c.id}><td>{c.criminal_id ?? c.id}</td><td>{c.name}</td><td>{c.age}</td><td>{c.gender}</td><td>{c.address}</td><td>{c.status}</td></tr>
          )) : <tr><td colSpan="6">No data</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
