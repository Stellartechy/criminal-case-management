import React, { useState } from "react";

function getList(body) {
  if (!body) return [];
  if (Array.isArray(body)) return body;
  return body.data ?? body;
}

export default function RetrieveFIR() {
  const [cases, setCases] = useState([]);

  const load = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/cases");
      const body = await res.json().catch(() => null);
      const list = getList(body);
      setCases(list || []);
    } catch (err) {
      console.error(err);
      alert("Error loading cases");
    }
  };

  return (
    <div className="card">
      <h4>Retrieve FIRs</h4>
      <button onClick={load}>Load FIRs</button>
      <table>
        <thead>
          <tr><th>Case ID</th><th>Criminal</th><th>Officer</th><th>Status</th><th>Date</th></tr>
        </thead>
        <tbody>
          {cases.length ? cases.map(c => (
            <tr key={c.case_id || c.id || Math.random()}>
              <td>{c.case_id ?? c.id}</td>
              <td>{(c.criminal && c.criminal.name) ?? c.criminal_id ?? "N/A"}</td>
              <td>{(c.officer && c.officer.name) ?? c.officer_id ?? "N/A"}</td>
              <td>{c.case_status ?? c.status ?? "N/A"}</td>
              <td>{c.case_date ?? "N/A"}</td>
            </tr>
          )) : <tr><td colSpan="5">No FIRs loaded</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
