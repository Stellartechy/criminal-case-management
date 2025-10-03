import { useState, useEffect } from "react";
import "./PoliceDashboard.css";

function PoliceDashboard({ user }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [criminals, setCriminals] = useState([]);
  const [cases, setCases] = useState([]);
  const [selectedCriminal, setSelectedCriminal] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [formData, setFormData] = useState({});
  const [officerDetails, setOfficerDetails] = useState({});
  const [loading, setLoading] = useState(false);

  const API = "http://127.0.0.1:8000";

  useEffect(() => {
    fetchOfficerDetails();
    fetchCriminals();
    fetchCases();
  }, []);

  // Fetch officer info for My Profile
  const fetchOfficerDetails = async () => {
    try {
      const res = await fetch(`${API}/officers/${user.user_id}`);
      const data = await res.json();
      setOfficerDetails(data);
    } catch (err) {
      console.error("Error fetching officer details:", err);
    }
  };

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
        officer_id: officerDetails.officer_id,
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
        const data = await res.json();
        alert(data.detail || "Failed to update case");
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

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2>Police Dashboard</h2>
        <ul>
          <li onClick={() => setActiveTab("profile")}>My Profile</li>
          <li onClick={() => setActiveTab("addCriminal")}>Register Criminal</li>
          <li onClick={() => setActiveTab("addCase")}>Register Case</li>
          <li onClick={() => setActiveTab("retrieveCriminal")}>Retrieve Criminal</li>
          <li onClick={() => setActiveTab("retrieveCase")}>Retrieve FIR</li>
          <li onClick={() => setActiveTab("deleteCriminal")}>Delete Criminal</li>
        </ul>
      </div>

      <div className="main-content">
        {/* ------------------ My Profile ------------------ */}
        {activeTab === "profile" && (
          <div>
            <h3>My Profile</h3>
            <p><strong>User ID:</strong> {officerDetails.user_id}</p>
            <p><strong>Officer ID:</strong> {officerDetails.officer_id}</p>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Rank:</strong> {officerDetails.rank_title}</p>
            <p><strong>Name:</strong> {officerDetails.name}</p>
            <p><strong>Station:</strong> {officerDetails.station}</p>
          </div>
        )}

        {/* ------------------ Register Criminal ------------------ */}
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

        {/* ------------------ Register Case ------------------ */}
        {activeTab === "addCase" && (
          <div>
            <h3>Register Case</h3>
            <label>FIR Date:</label>
            <input type="date" name="fir_date" onChange={handleCaseChange} />
            <label>Crime Type:</label>
            <input name="crime_type" placeholder="Crime Type" onChange={handleCaseChange} />
            <label>Crime Date:</label>
            <input type="date" name="crime_date" onChange={handleCaseChange} />
            <label>Crime Description:</label>
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

        {/* ------------------ Retrieve Criminal ------------------ */}
        {activeTab === "retrieveCriminal" && (
          <div>
            <h3>Criminals</h3>
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Name</th><th>Age</th><th>Gender</th><th>Address</th><th>Status</th><th>Associated Crimes</th><th>Actions</th>
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
                    <td>{c.cases?.map(f => f.crime_type).join(", ") || "-"}</td>
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
                <label>Name:</label>
                <input name="name" value={formData.name || ""} onChange={handleCriminalChange} />
                <label>Age:</label>
                <input name="age" type="number" value={formData.age || ""} onChange={handleCriminalChange} />
                <label>Gender:</label>
                <input name="gender" value={formData.gender || ""} onChange={handleCriminalChange} />
                <label>Address:</label>
                <input name="address" value={formData.address || ""} onChange={handleCriminalChange} />
                <label>Status:</label>
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

        {/* ------------------ Retrieve FIR ------------------ */}
        {activeTab === "retrieveCase" && (
          <div>
            <h3>FIRs</h3>
            <table>
              <thead>
                <tr>
                  <th>Officer ID</th>
                  <th>Officer Name</th>
                  <th>FIR ID</th>
                  <th>FIR Date</th>
                  <th>Case Status</th>
                  <th>Crime Type</th>
                  <th>Crime Date</th>
                  <th>Crime Description</th>
                  <th>Verdict</th>
                  <th>Punishment Type</th>
                  <th>Punishment Duration (yrs)</th>
                  <th>Punishment Start Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cases.map(f => (
                  <tr key={f.fir_id}>
                    <td>{f.officer_id}</td>
                    <td>{f.officer_name}</td>
                    <td>{f.fir_id}</td>
                    <td>{f.fir_date}</td>
                    <td>{f.case_status}</td>
                    <td>{f.crime_type}</td>
                    <td>{f.crime_date}</td>
                    <td>{f.crime_description}</td>
                    <td>{f.verdict}</td>
                    <td>{f.punishment_type}</td>
                    <td>{f.punishment_duration_years}</td>
                    <td>{f.punishment_start_date}</td>
                    <td>
                      <button onClick={() => { setSelectedCase(f); setFormData(f); }}>Update</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {selectedCase && (
              <div>
                <h4>Update FIR</h4>
                <label>Case Status:</label>
                <select name="case_status" value={formData.case_status || ""} onChange={handleCaseChange}>
                  <option value="Open">Open</option>
                  <option value="In Court">In Court</option>
                  <option value="Closed">Closed</option>
                </select>
                <label>Crime Type:</label>
                <input name="crime_type" value={formData.crime_type || ""} onChange={handleCaseChange} />
                <label>Crime Date:</label>
                <input type="date" name="crime_date" value={formData.crime_date || ""} onChange={handleCaseChange} />
                <label>Crime Description:</label>
                <textarea name="crime_description" value={formData.crime_description || ""} onChange={handleCaseChange} />
                <label>Verdict:</label>
                <select name="verdict" value={formData.verdict || ""} onChange={handleCaseChange}>
                  <option value="">Pending</option>
                  <option value="Guilty">Guilty</option>
                  <option value="Not Guilty">Not Guilty</option>
                </select>
                <label>Punishment Type:</label>
                <input name="punishment_type" value={formData.punishment_type || ""} onChange={handleCaseChange} />
                <label>Punishment Duration (yrs):</label>
                <input type="number" name="punishment_duration_years" value={formData.punishment_duration_years || ""} onChange={handleCaseChange} />
                <label>Punishment Start Date:</label>
                <input type="date" name="punishment_start_date" value={formData.punishment_start_date || ""} onChange={handleCaseChange} />
                <button onClick={updateCase} disabled={loading}>{loading ? "Updating..." : "Update FIR"}</button>
              </div>
            )}
          </div>
        )}

        {/* ------------------ Delete Criminal ------------------ */}
        {activeTab === "deleteCriminal" && (
          <div>
            <h3>Delete Criminal</h3>
            <ul>
              {criminals.map(c => (
                <li key={c.criminal_id}>
                  {c.criminal_id} - {c.name} <button onClick={() => deleteCriminal(c.criminal_id)}>Delete</button>
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
