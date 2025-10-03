import { useState, useEffect } from "react";
import "./PoliceDashboard.css";

function PoliceDashboard({ user }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [criminals, setCriminals] = useState([]);
  const [cases, setCases] = useState([]);
  const [selectedCriminal, setSelectedCriminal] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  const API = "http://127.0.0.1:8000";

  useEffect(() => {
    fetchCriminals();
    fetchCases();
  }, []);

  const fetchCriminals = async () => {
    try {
      const res = await fetch(`${API}/criminals`);
      const data = await res.json();
      setCriminals(data);
    } catch (err) {
      console.error("Error fetching criminals:", err);
    }
  };

  const fetchCases = async () => {
    try {
      const res = await fetch(`${API}/cases`);
      const data = await res.json();
      setCases(data);
    } catch (err) {
      console.error("Error fetching cases:", err);
    }
  };

  const handleCriminalChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCaseChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addCriminal = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/criminals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("Criminal added!");
        fetchCriminals();
        setFormData({});
      } else {
        alert("Failed to add criminal");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addCase = async () => {
    if (!formData.criminal_ids || formData.criminal_ids.length === 0) {
      alert("Select at least one criminal");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        ...formData,
        officer_id: user.user_id, // officer id from login
      };
      const res = await fetch(`${API}/cases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert("Case added!");
        fetchCases();
        setFormData({});
      } else {
        const data = await res.json();
        alert(data.detail || "Failed to add case");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateCriminal = async () => {
    if (!selectedCriminal) return;
    try {
      setLoading(true);
      const res = await fetch(`${API}/criminals/${selectedCriminal.criminal_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("Criminal updated!");
        fetchCriminals();
        setSelectedCriminal(null);
        setFormData({});
      } else {
        alert("Failed to update criminal");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateCase = async () => {
    if (!selectedCase) return;
    try {
      setLoading(true);
      const res = await fetch(`${API}/cases/${selectedCase.fir_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("Case updated!");
        fetchCases();
        setSelectedCase(null);
        setFormData({});
      } else {
        alert("Failed to update case");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteCriminal = async (criminal_id) => {
    if (!window.confirm("Are you sure you want to delete this criminal?")) return;
    try {
      const res = await fetch(`${API}/criminals/${criminal_id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Criminal deleted");
        fetchCriminals();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCase = async (fir_id) => {
    if (!window.confirm("Are you sure you want to delete this case?")) return;
    try {
      const res = await fetch(`${API}/cases/${fir_id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Case deleted");
        fetchCases();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2>Police Dashboard</h2>
        <ul>
          <li onClick={() => setActiveTab("profile")}>My Profile</li>
          <li onClick={() => setActiveTab("addCriminal")}>Register Criminal</li>
          <li onClick={() => setActiveTab("addCase")}>Register Case</li>
          <li onClick={() => setActiveTab("retrieveCriminal")}>Retrieve Criminal</li>
          <li onClick={() => setActiveTab("retrieveCase")}>Retrieve Case</li>
          <li onClick={() => setActiveTab("deleteCriminal")}>Delete Criminal</li>
          <li onClick={() => setActiveTab("deleteCase")}>Delete Case</li>
        </ul>
      </div>

      <div className="main-content">
        {activeTab === "profile" && (
          <div>
            <h3>My Profile</h3>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </div>
        )}

        {activeTab === "addCriminal" && (
          <div>
            <h3>Register Criminal</h3>
            <input name="name" placeholder="Name" onChange={handleCriminalChange} />
            <input name="age" type="number" placeholder="Age" onChange={handleCriminalChange} />
            <input name="gender" placeholder="Gender" onChange={handleCriminalChange} />
            <input name="address" placeholder="Address" onChange={handleCriminalChange} />
            <select name="status" onChange={handleCriminalChange}>
              <option value="Under Trial">Under Trial</option>
              <option value="Released">Released</option>
              <option value="Convicted">Convicted</option>
            </select>
            <button onClick={addCriminal} disabled={loading}>{loading ? "Adding..." : "Add Criminal"}</button>
          </div>
        )}

        {activeTab === "addCase" && (
          <div>
            <h3>Register Case</h3>
            <input type="date" name="fir_date" onChange={handleCaseChange} />
            <input name="crime_type" placeholder="Crime Type" onChange={handleCaseChange} />
            <input type="date" name="crime_date" onChange={handleCaseChange} />
            <textarea name="crime_description" placeholder="Description" onChange={handleCaseChange} />
            <label>Select Criminal(s):</label>
            <select name="criminal_ids" multiple onChange={(e) =>
              setFormData({
                ...formData,
                criminal_ids: Array.from(e.target.selectedOptions, option => parseInt(option.value))
              })
            }>
              {criminals.map(c => (
                <option key={c.criminal_id} value={c.criminal_id}>{c.name}</option>
              ))}
            </select>
            <button onClick={addCase} disabled={loading}>{loading ? "Adding..." : "Add Case"}</button>
          </div>
        )}

        {activeTab === "retrieveCriminal" && (
          <div>
            <h3>Criminals</h3>
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Name</th><th>Age</th><th>Gender</th><th>Address</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {criminals.map(c => (
                  <tr key={c.criminal_id}>
                    <td>{c.criminal_id}</td>
                    <td>{c.name}</td>
                    <td>{c.age}</td>
                    <td>{c.gender}</td>
                    <td>{c.address}</td>
                    <td>{c.status}</td>
                    <td>
                      <button onClick={() => { setSelectedCriminal(c); setFormData(c); }}>Update</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {selectedCriminal && (
              <div>
                <h4>Update Criminal</h4>
                <input name="name" placeholder="Name" value={formData.name || ""} onChange={handleCriminalChange} />
                <input name="age" type="number" placeholder="Age" value={formData.age || ""} onChange={handleCriminalChange} />
                <input name="gender" placeholder="Gender" value={formData.gender || ""} onChange={handleCriminalChange} />
                <input name="address" placeholder="Address" value={formData.address || ""} onChange={handleCriminalChange} />
                <select name="status" value={formData.status || ""} onChange={handleCriminalChange}>
                  <option value="Under Trial">Under Trial</option>
                  <option value="Released">Released</option>
                  <option value="Convicted">Convicted</option>
                </select>
                <button onClick={updateCriminal} disabled={loading}>{loading ? "Updating..." : "Update Criminal"}</button>
              </div>
            )}
          </div>
        )}

        {activeTab === "retrieveCase" && (
          <div>
            <h3>Cases</h3>
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Crime Type</th><th>Crime Date</th><th>Status</th><th>Verdict</th><th>Punishment</th><th>Criminals</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cases.map(c => (
                  <tr key={c.fir_id}>
                    <td>{c.fir_id}</td>
                    <td>{c.crime_type}</td>
                    <td>{c.crime_date}</td>
                    <td>{c.case_status}</td>
                    <td>{c.verdict}</td>
                    <td>{c.punishment_type ? `${c.punishment_type} (${c.punishment_duration_years} yrs)` : "-"}</td>
                    <td>{c.criminals.map(cr => cr.name).join(", ")}</td>
                    <td>
                      <button onClick={() => { setSelectedCase(c); setFormData(c); }}>Update</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {selectedCase && (
              <div>
                <h4>Update Case</h4>
                <input type="date" name="fir_date" value={formData.fir_date || ""} onChange={handleCaseChange} />
                <input name="crime_type" placeholder="Crime Type" value={formData.crime_type || ""} onChange={handleCaseChange} />
                <input type="date" name="crime_date" value={formData.crime_date || ""} onChange={handleCaseChange} />
                <textarea name="crime_description" placeholder="Description" value={formData.crime_description || ""} onChange={handleCaseChange} />
                <select name="case_status" value={formData.case_status || ""} onChange={handleCaseChange}>
                  <option value="Open">Open</option>
                  <option value="In Court">In Court</option>
                  <option value="Closed">Closed</option>
                </select>
                <select name="verdict" value={formData.verdict || ""} onChange={handleCaseChange}>
                  <option value="">Pending</option>
                  <option value="Guilty">Guilty</option>
                  <option value="Not Guilty">Not Guilty</option>
                </select>
                <input name="punishment_type" placeholder="Punishment Type" value={formData.punishment_type || ""} onChange={handleCaseChange} />
                <input type="number" name="punishment_duration_years" placeholder="Duration (yrs)" value={formData.punishment_duration_years || ""} onChange={handleCaseChange} />
                <input type="date" name="punishment_start_date" value={formData.punishment_start_date || ""} onChange={handleCaseChange} />
                <button onClick={updateCase} disabled={loading}>{loading ? "Updating..." : "Update Case"}</button>
              </div>
            )}
          </div>
        )}

        {activeTab === "deleteCriminal" && (
          <div>
            <h3>Delete Criminal</h3>
            <ul>
              {criminals.map(c => (
                <li key={c.criminal_id}>
                  {c.name} <button onClick={() => deleteCriminal(c.criminal_id)}>Delete</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === "deleteCase" && (
          <div>
            <h3>Delete Case</h3>
            <ul>
              {cases.map(c => (
                <li key={c.fir_id}>
                  {c.crime_type} ({c.crime_date}) <button onClick={() => deleteCase(c.fir_id)}>Delete</button>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}

export default PoliceDashboard;
