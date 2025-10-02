import React, { useEffect, useState } from "react";

function CaseList() {
  const [cases, setCases] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/cases")
      .then((res) => res.json())
      .then((data) => setCases(data));
  }, []);

  return (
    <div>
      <h2>All Cases</h2>
      <ul>
        {cases.map((c) => (
          <li key={c.id}>
            <strong>{c.title}</strong> - {c.description}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CaseList;
