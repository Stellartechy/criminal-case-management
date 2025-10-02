import React, { useState } from "react";

function AddCriminal() {
  const [name, setName] = useState("");
  const [crime, setCrime] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("http://127.0.0.1:8000/criminals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, crime }),
    });
    if (response.ok) {
      alert("Criminal added successfully!");
      setName("");
      setCrime("");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Criminal</h2>
      <input
        type="text"
        placeholder="Criminal Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Crime"
        value={crime}
        onChange={(e) => setCrime(e.target.value)}
        required
      />
      <button type="submit">Add Criminal</button>
    </form>
  );
}

export default AddCriminal;
