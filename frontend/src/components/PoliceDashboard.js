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
    fetchCriminals();
    fetchCases();
    fetchOfficerDetails();
  }, []);

  // ---------------- Fetch officer info ----------------
  const fetchOfficerDetails = async () => {
    try {
      const res = await fetch(`${API}/officers/${user.user_id}`);
      const data = await res.json();
      setOfficerDetails(data);
    } catch (err) {
      console.error("Error fetching officer details:", err);
    }
  };

  // ---------------- Fetch criminals ----------------
  const fetchCriminals = async () => {
    try {
      const res = await fetch(`${API}/criminals`);
      const data = await res.json();
      setCriminals(data);
    } catch (err) {
      console.error("Error fetching criminals:", err);
    }
  };

  // ---------------- Fetch cases ----------------
  const fetchCases = async () => {
    try {
      const res = await fetch(`${API}/cases`);
      const data = await res.json();
      setCases(data);
    } catch (err) {
      console.error("Error fetching cases:", err);
    }
  };

  // ---------------- Form handlers ----------------
  const handleChange = (e) => {
    const { name, value, options, multiple } = e.target;
    if (multiple) {
      const selected = Array.from(options)
        .filter((opt) => opt.selected)
        .map((opt) => parseInt(opt.value));
      setFormData({ ...formData, [name]: selected });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // ---------------- Criminal CRUD ----------------------
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
        const data = await res.json();
        alert(data.detail || "Failed to add criminal");
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
        const data = await res.json();
        alert(data.detail || "Failed to update criminal");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteCriminal = async (id) => {
    if (!window.confirm("Are you sure you want to delete this criminal?")) return;
    try {
      const res = await fetch(`${API}/criminals/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Criminal deleted");
        fetchCriminals();
        fetchCases(); // Refresh cases since criminals might be linked
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectCriminalForEdit = (criminal) => {
    setSelectedCriminal(criminal);
    setFormData(criminal);
    setActiveTab("updateCriminal");
  };

  // ---------------- Case CRUD --------------------------
  const addCase = async () => {
    if (!formData.criminal_ids || formData.criminal_ids.length === 0) {
      alert("Select at least one criminal");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        fir_date: formData.fir_date || null,
        crime_type: formData.crime_type,
        crime_date: formData.crime_date,
        crime_description: formData.crime_description,
        verdict: formData.verdict || "Pending",
        punishment_type: formData.punishment_type || null,
        punishment_duration_years: formData.punishment_duration_years
          ? parseInt(formData.punishment_duration_years)
          : null,
        punishment_start_date: formData.punishment_start_date || null,
        criminal_ids: formData.criminal_ids.map((id) => parseInt(id)),
      };
      const res = await fetch(`${API}/cases?officer_id=${officerDetails.officer_id}`, {
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

  const selectCaseForEdit = (c) => {
    setSelectedCase(c);
    setFormData({
      ...c,
      criminal_ids: c.criminals.map((cr) => cr.criminal_id),
    });
    setActiveTab("updateCase");
  };

  const updateCase = async () => {
    if (!selectedCase) return;
    try {
      setLoading(true);
      const payload = {
        fir_date: formData.fir_date || null,
        crime_type: formData.crime_type,
        crime_date: formData.crime_date,
        crime_description: formData.crime_description,
        case_status: formData.case_status,
        verdict: formData.verdict,
        punishment_type: formData.punishment_type || null,
        punishment_duration_years: formData.punishment_duration_years
          ? parseInt(formData.punishment_duration_years)
          : null,
        punishment_start_date: formData.punishment_start_date || null,
        criminal_ids: formData.criminal_ids.map((id) => parseInt(id)),
      };
      const res = await fetch(`${API}/cases/${selectedCase.fir_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  // ---------------- Render UI -----------------------------
  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2>Police Dashboard</h2>
        <ul>
          <li onClick={() => setActiveTab("profile")}>My Profile</li>
          <li onClick={() => setActiveTab("addCriminal")}>Register Criminal</li>
          <li onClick={() => selectedCriminal && setActiveTab("updateCriminal")}>Update Criminal</li>
          <li onClick={() => setActiveTab("addCase")}>Register Case</li>
          <li onClick={() => selectedCase && setActiveTab("updateCase")}>Update Case</li>
          <li onClick={() => setActiveTab("retrieveCriminal")}>Retrieve Criminals</li>
          <li onClick={() => setActiveTab("retrieveCase")}>Retrieve FIRs</li>
        </ul>
      </div>

      <div className="main-content">
        {/* Profile */}
        {activeTab === "profile" && (
          <div>
            <h3>My Profile</h3>
            <p><strong>User ID:</strong> {officerDetails.user_id}</p>
            <p><strong>Officer ID:</strong> {officerDetails.officer_id}</p>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Name:</strong> {officerDetails.name}</p>
            <p><strong>Rank:</strong> {officerDetails.rank_title}</p>
            <p><strong>Station:</strong> {officerDetails.station}</p>
          </div>
        )}

        {/* Register Criminal */}
        {activeTab === "addCriminal" && (
          <div>
            <h3>Register Criminal</h3>
            <input name="name" placeholder="Name" value={formData.name || ""} onChange={handleChange} />
            <input name="age" type="number" placeholder="Age" value={formData.age || ""} onChange={handleChange} />
            <input name="gender" placeholder="Gender" value={formData.gender || ""} onChange={handleChange} />
            <input name="address" placeholder="Address" value={formData.address || ""} onChange={handleChange} />
            <select name="status" value={formData.status || "Under Trial"} onChange={handleChange}>
              <option value="Under Trial">Under Trial</option>
              <option value="Released">Released</option>
              <option value="Convicted">Convicted</option>
            </select>
            <button onClick={addCriminal} disabled={loading}>{loading ? "Adding..." : "Add Criminal"}</button>
          </div>
        )}

        {/* Update Criminal */}
        {activeTab === "updateCriminal" && selectedCriminal && (
          <div>
            <h3>Update Criminal</h3>
            <input name="name" placeholder="Name" value={formData.name || ""} onChange={handleChange} />
            <input name="age" type="number" placeholder="Age" value={formData.age || ""} onChange={handleChange} />
            <input name="gender" placeholder="Gender" value={formData.gender || ""} onChange={handleChange} />
            <input name="address" placeholder="Address" value={formData.address || ""} onChange={handleChange} />
            <select name="status" value={formData.status || ""} onChange={handleChange}>
              <option value="Under Trial">Under Trial</option>
              <option value="Released">Released</option>
              <option value="Convicted">Convicted</option>
            </select>
            <button onClick={updateCriminal} disabled={loading}>{loading ? "Updating..." : "Update Criminal"}</button>
          </div>
        )}

        {/* Register Case */}
        {activeTab === "addCase" && (
          <div>
            <h3>Register Case</h3>
            <input type="date" name="fir_date" value={formData.fir_date || ""} onChange={handleChange} />
            <input name="crime_type" placeholder="Crime Type" value={formData.crime_type || ""} onChange={handleChange} />
            <input type="date" name="crime_date" value={formData.crime_date || ""} onChange={handleChange} />
            <textarea name="crime_description" placeholder="Crime Description" value={formData.crime_description || ""} onChange={handleChange} />
            <label>Select Criminal(s):</label>
            <select name="criminal_ids" multiple value={formData.criminal_ids || []} onChange={handleChange}>
              {criminals.map(c => <option key={c.criminal_id} value={c.criminal_id}>{c.name}</option>)}
            </select>
            <button onClick={addCase} disabled={loading}>{loading ? "Adding..." : "Add Case"}</button>
          </div>
        )}

        {/* Update Case */}
        {activeTab === "updateCase" && selectedCase && (
          <div>
            <h3>Update Case</h3>
            <input type="date" name="fir_date" value={formData.fir_date || ""} onChange={handleChange} />
            <input name="crime_type" placeholder="Crime Type" value={formData.crime_type || ""} onChange={handleChange} />
            <input type="date" name="crime_date" value={formData.crime_date || ""} onChange={handleChange} />
            <textarea name="crime_description" placeholder="Crime Description" value={formData.crime_description || ""} onChange={handleChange} />
            <select name="case_status" value={formData.case_status || "Open"} onChange={handleChange}>
              <option value="Open">Open</option>
              <option value="In Court">In Court</option>
              <option value="Closed">Closed</option>
            </select>
            <select name="verdict" value={formData.verdict || "Pending"} onChange={handleChange}>
              <option value="Pending">Pending</option>
              <option value="Guilty">Guilty</option>
              <option value="Not Guilty">Not Guilty</option>
            </select>
            <input name="punishment_type" placeholder="Punishment Type" value={formData.punishment_type || ""} onChange={handleChange} />
            <input type="number" name="punishment_duration_years" placeholder="Duration (yrs)" value={formData.punishment_duration_years || ""} onChange={handleChange} />
            <input type="date" name="punishment_start_date" value={formData.punishment_start_date || ""} onChange={handleChange} />
            <label>Select Criminal(s):</label>
            <select name="criminal_ids" multiple value={formData.criminal_ids || []} onChange={handleChange}>
              {criminals.map(c => <option key={c.criminal_id} value={c.criminal_id}>{c.name}</option>)}
            </select>
            <button onClick={updateCase} disabled={loading}>{loading ? "Updating..." : "Update Case"}</button>
          </div>
        )}

        {/* Retrieve Criminals */}
        {activeTab === "retrieveCriminal" && (
          <div>
            <h3>Criminals</h3>
            <ul>
              {criminals.map(c => (
                <li key={c.criminal_id}>
                  {c.name} - Age: {c.age} - Gender: {c.gender} - Status: {c.status}
                  <button onClick={() => selectCriminalForEdit(c)}>Edit</button>
                  <button onClick={() => deleteCriminal(c.criminal_id)}>Delete</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Retrieve Cases */}
        {activeTab === "retrieveCase" && (
          <div>
            <h3>FIRs / Cases</h3>
            <ul>
              {cases.map(f => (
                <li key={f.fir_id}>
                  <p><strong>FIR ID:</strong> {f.fir_id}</p>
                  <p><strong>Officer:</strong> {f.officer_name} (ID: {f.officer_id})</p>
                  <p><strong>FIR Date:</strong> {f.fir_date}</p>
                  <p><strong>Case Status:</strong> {f.case_status}</p>
                  <p><strong>Crime Type:</strong> {f.crime_type}</p>
                  <p><strong>Crime Date:</strong> {f.crime_date}</p>
                  <p><strong>Crime Description:</strong> {f.crime_description}</p>
                  <p><strong>Verdict:</strong> {f.verdict}</p>
                  <p><strong>Punishment:</strong> {f.punishment_type} ({f.punishment_duration_years} yrs)</p>
                  <p><strong>Criminals:</strong> {f.criminals.map(c => c.name).join(", ")}</p>
                  <button onClick={() => selectCaseForEdit(f)}>Edit Case</button>
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
