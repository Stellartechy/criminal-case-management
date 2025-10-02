import React, { useEffect, useState } from "react";

function CriminalList() {
  const [criminals, setCriminals] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/criminals")
      .then((res) => res.json())
      .then((data) => setCriminals(data));
  }, []);

  return (
    <div>
      <h2>All Criminals</h2>
      <ul>
        {criminals.map((cr) => (
          <li key={cr.id}>
            <strong>{cr.name}</strong> - {cr.crime}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CriminalList;
