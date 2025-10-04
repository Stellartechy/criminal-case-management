// AdminDashboard.js
import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";

const API = "http://127.0.0.1:8000";

function AdminDashboard({ user }) {
  // Top-level tab
  const [activeTab, setActiveTab] = useState("profile"); // profile | fir | criminals | operators
  // Subviews inside the white area (register/retrieve/edit)
  const [subView, setSubView] = useState(null);
  // Data sets
  const [criminals, setCriminals] = useState([]);
  const [cases, setCases] = useState([]);
  const [operators, setOperators] = useState([]);
  const [officerDetails, setOfficerDetails] = useState(null);

  // selection & forms
  const [selectedCriminal, setSelectedCriminal] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  // INITIAL / refresh fetchers
  useEffect(() => {
    // Always load basic lists so retrieving immediately works
    fetchCriminals();
    fetchCases();
    fetchOperators();
    if (user?.role === "police") fetchOfficerDetails();
    // default subview depending on activeTab
    if (activeTab === "fir") setSubView("registerCase");
    if (activeTab === "criminals") setSubView("registerCriminal");
    if (activeTab === "operators") setSubView(null); // landing boxes
  }, [activeTab]); // note: this runs when activeTab changes

  // fetch helpers
  const fetchCriminals = async () => {
    try {
      const res = await fetch(`${API}/criminals`);
      if (!res.ok) throw new Error("Failed fetching criminals");
      const data = await res.json();
      setCriminals(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCases = async () => {
    try {
      const res = await fetch(`${API}/cases`);
      if (!res.ok) throw new Error("Failed fetching cases");
      const data = await res.json();
      setCases(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOperators = async () => {
    try {
      const res = await fetch(`${API}/users?role=police`);
      if (!res.ok) throw new Error("Failed fetching operators");
      const data = await res.json();
      setOperators(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOfficerDetails = async () => {
    try {
      const res = await fetch(`${API}/officers/${user.user_id}`);
      if (res.ok) {
        const data = await res.json();
        setOfficerDetails(data);
      }
    } catch (err) {
      console.error("No officer details:", err);
    }
  };

  // form input
  const handleChange = (e) => {
    const { name, value, options, multiple } = e.target;
    if (multiple) {
      const selected = Array.from(options).filter((o) => o.selected).map((o) => parseInt(o.value));
      setFormData((p) => ({ ...p, [name]: selected }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  // ---------------- Criminal CRUD (same behavior as Police) ----------------
  const addCriminal = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/criminals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to add criminal");
      }
      alert("Criminal added");
      fetchCriminals();
      setFormData({});
      setSubView("retrieveCriminal");
    } catch (err) {
      alert(err.message || "Error adding criminal");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectCriminalForEdit = (c) => {
    setSelectedCriminal(c);
    setFormData(c);
    setSubView("updateCriminal");
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
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to update criminal");
      }
      alert("Criminal updated");
      fetchCriminals();
      setSelectedCriminal(null);
      setFormData({});
      setSubView("retrieveCriminal");
    } catch (err) {
      alert(err.message || "Error updating criminal");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteCriminal = async (id) => {
    if (!window.confirm("Delete criminal?")) return;
    try {
      const res = await fetch(`${API}/criminals/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      alert("Deleted");
      fetchCriminals();
      fetchCases();
    } catch (err) {
      alert(err.message || "Error deleting criminal");
      console.error(err);
    }
  };

  // ---------------- Case CRUD (Admin can register & update; reuse Police logic) ----------------
  const addCase = async () => {
    if (!formData.criminal_ids || formData.criminal_ids.length === 0) {
      alert("Select at least one criminal");
      return;
    }
    // admin needs to supply officer_id as query param; if omitted, backend example uses 1
    const officerId = formData.officer_id || 1;
    try {
      setLoading(true);
      const payload = {
        fir_date: formData.fir_date || null,
        crime_type: formData.crime_type,
        crime_date: formData.crime_date,
        crime_description: formData.crime_description,
        verdict: formData.verdict || "Pending",
        punishment_type: formData.punishment_type || null,
        punishment_duration_years: formData.punishment_duration_years ? parseInt(formData.punishment_duration_years) : null,
        punishment_start_date: formData.punishment_start_date || null,
        criminal_ids: (formData.criminal_ids || []).map((id) => parseInt(id)),
      };
      const res = await fetch(`${API}/cases?officer_id=${officerId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to add case");
      }
      alert("Case added");
      fetchCases();
      setFormData({});
      setSubView("retrieveCase");
    } catch (err) {
      alert(err.message || "Error adding case");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectCaseForEdit = (c) => {
    setSelectedCase(c);
    setFormData({ ...c, criminal_ids: (c.criminals || []).map((cr) => cr.criminal_id) });
    setSubView("updateCase");
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
        punishment_duration_years: formData.punishment_duration_years ? parseInt(formData.punishment_duration_years) : null,
        punishment_start_date: formData.punishment_start_date || null,
        criminal_ids: (formData.criminal_ids || []).map((id) => parseInt(id)),
      };
      const res = await fetch(`${API}/cases/${selectedCase.fir_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to update case");
      }
      alert("Case updated");
      fetchCases();
      setSelectedCase(null);
      setFormData({});
      setSubView("retrieveCase");
    } catch (err) {
      alert(err.message || "Error updating case");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Operator management ----------------
  const addOperator = async () => {
    // required fields: username, password, role, name
    if (!formData.username || !formData.password || !formData.role || !formData.name) {
      alert("Please fill username, password, name and role");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to add operator");
      }
      alert("Operator added");
      fetchOperators();
      setFormData({});
      setSubView("retrieveOperator");
    } catch (err) {
      alert(err.message || "Error adding operator");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectOperatorForEdit = (op) => {
    setSelectedOperator(op);
    // fill form; password intentionally blank (only set if admin enters new password)
    setFormData({ username: op.username, name: op.name, role: op.role, password: "" });
    setSubView("editOperator");
  };

  const updateOperator = async () => {
    if (!selectedOperator) return;
    // construct payload: include password only if provided (backend should handle empty/absent password appropriately)
    const payload = {};
    if (formData.username) payload.username = formData.username;
    if (formData.name) payload.name = formData.name;
    if (formData.role) payload.role = formData.role;
    // include password even if empty string? We will include only when non-empty to avoid overwriting with blank
    if (formData.password && formData.password.trim() !== "") payload.password = formData.password;

    // Note: your backend update_user expects a full-like object; we attempt to send payload. If backend demands full schema, send the full fields.
    try {
      setLoading(true);
      const res = await fetch(`${API}/users/${selectedOperator.user_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...selectedOperator, ...payload }), // sending full object (safer for schema)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to update operator");
      }
      alert("Operator updated");
      fetchOperators();
      setSelectedOperator(null);
      setFormData({});
      setSubView("retrieveOperator");
    } catch (err) {
      alert(err.message || "Error updating operator");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteOperator = async (id) => {
    if (!window.confirm("Delete operator?")) return;
    try {
      const res = await fetch(`${API}/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to delete operator");
      }
      alert("Deleted");
      fetchOperators();
    } catch (err) {
      alert(err.message || "Error deleting operator");
      console.error(err);
    }
  };

  // ---------------- Render UI ----------------
  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2>Admin Dashboard</h2>
        <ul>
          <li onClick={() => { setActiveTab("profile"); setSubView(null); }}>My Profile</li>
          <li onClick={() => { setActiveTab("fir"); setSubView("registerCase"); }}>FIR Management</li>
          <li onClick={() => { setActiveTab("criminals"); setSubView("registerCriminal"); }}>Criminal Management</li>
          <li onClick={() => { setActiveTab("operators"); setSubView(null); }}>Operator Management</li>
        </ul>
      </div>

      <div className="main-content">
        {/* PROFILE */}
        {activeTab === "profile" && (
          <div className="card">
            <h3>My Profile</h3>
            <p><strong>User ID:</strong> {user?.user_id}</p>
            <p><strong>Username:</strong> {user?.username}</p>
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Role:</strong> {user?.role}</p>
            {user?.role === "police" && officerDetails && (
              <>
                <p><strong>Officer ID:</strong> {officerDetails.officer_id}</p>
                <p><strong>Rank:</strong> {officerDetails.rank_title}</p>
                <p><strong>Station:</strong> {officerDetails.station}</p>
              </>
            )}
          </div>
        )}

        {/* FIR MANAGEMENT */}
        {activeTab === "fir" && (
          <div>
            <div className="button-grid" style={{ marginBottom: 20 }}>
              <div className="card" onClick={() => setSubView("registerCase")} style={{ cursor: "pointer" }}>
                <h3>Register Case</h3>
                <p>Create a new FIR (case)</p>
              </div>
              <div className="card" onClick={() => { setSubView("retrieveCase"); fetchCases(); }} style={{ cursor: "pointer" }}>
                <h3>Retrieve FIRs</h3>
                <p>View and edit FIRs</p>
              </div>
            </div>

            {/* Register Case */}
            {subView === "registerCase" && (
              <div className="card">
                <h3>Register Case</h3>
                <label>Officer ID (query param)</label>
                <input name="officer_id" value={formData.officer_id || ""} onChange={handleChange} placeholder="officer_id (number)" />
                <label>FIR Date</label>
                <input type="date" name="fir_date" value={formData.fir_date || ""} onChange={handleChange} />
                <label>Crime Type</label>
                <input name="crime_type" placeholder="Crime Type" value={formData.crime_type || ""} onChange={handleChange} />
                <label>Crime Date</label>
                <input type="date" name="crime_date" value={formData.crime_date || ""} onChange={handleChange} />
                <label>Crime Description</label>
                <textarea name="crime_description" value={formData.crime_description || ""} onChange={handleChange} />
                <label>Select Criminal(s)</label>
                <select name="criminal_ids" multiple value={formData.criminal_ids || []} onChange={handleChange}>
                  {criminals.map((c) => <option key={c.criminal_id} value={c.criminal_id}>{c.name}</option>)}
                </select>
                <button onClick={addCase} disabled={loading}>{loading ? "Adding..." : "Add Case"}</button>
              </div>
            )}

            {/* Update Case */}
            {subView === "updateCase" && selectedCase && (
              <div className="card">
                <h3>Update Case</h3>
                <label>FIR Date</label>
                <input type="date" name="fir_date" value={formData.fir_date || ""} onChange={handleChange} />
                <label>Crime Type</label>
                <input name="crime_type" placeholder="Crime Type" value={formData.crime_type || ""} onChange={handleChange} />
                <label>Crime Date</label>
                <input type="date" name="crime_date" value={formData.crime_date || ""} onChange={handleChange} />
                <label>Crime Description</label>
                <textarea name="crime_description" value={formData.crime_description || ""} onChange={handleChange} />
                <label>Case Status</label>
                <select name="case_status" value={formData.case_status || "Open"} onChange={handleChange}>
                  <option value="Open">Open</option>
                  <option value="In Court">In Court</option>
                  <option value="Closed">Closed</option>
                </select>
                <label>Verdict</label>
                <select name="verdict" value={formData.verdict || "Pending"} onChange={handleChange}>
                  <option value="Pending">Pending</option>
                  <option value="Guilty">Guilty</option>
                  <option value="Not Guilty">Not Guilty</option>
                </select>
                <label>Punishment Type</label>
                <input name="punishment_type" value={formData.punishment_type || ""} onChange={handleChange} />
                <label>Duration (years)</label>
                <input type="number" name="punishment_duration_years" value={formData.punishment_duration_years || ""} onChange={handleChange} />
                <label>Punishment Start Date</label>
                <input type="date" name="punishment_start_date" value={formData.punishment_start_date || ""} onChange={handleChange} />
                <label>Select Criminal(s)</label>
                <select name="criminal_ids" multiple value={formData.criminal_ids || []} onChange={handleChange}>
                  {criminals.map((c) => <option key={c.criminal_id} value={c.criminal_id}>{c.name}</option>)}
                </select>
                <button onClick={updateCase} disabled={loading}>{loading ? "Updating..." : "Update Case"}</button>
              </div>
            )}

            {/* Retrieve Cases */}
            {subView === "retrieveCase" && (
              <div className="card">
                <h3>FIRs / Cases</h3>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>FIR ID</th><th>Officer</th><th>FIR Date</th><th>Crime Type</th><th>Case Status</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cases.map((f) => (
                        <tr key={f.fir_id}>
                          <td>{f.fir_id}</td>
                          <td>{f.officer_name} (ID: {f.officer_id})</td>
                          <td>{f.fir_date}</td>
                          <td>{f.crime_type}</td>
                          <td>{f.case_status}</td>
                          <td>
                            <button onClick={() => selectCaseForEdit(f)}>Edit Case</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CRIMINAL MANAGEMENT */}
        {activeTab === "criminals" && (
          <div>
            <div className="button-grid" style={{ marginBottom: 20 }}>
              <div className="card" onClick={() => setSubView("registerCriminal")} style={{ cursor: "pointer" }}>
                <h3>Register Criminal</h3>
                <p>Add criminal record</p>
              </div>
              <div className="card" onClick={() => { setSubView("retrieveCriminal"); fetchCriminals(); }} style={{ cursor: "pointer" }}>
                <h3>Retrieve Criminals</h3>
                <p>View, edit or delete criminals</p>
              </div>
            </div>

            {subView === "registerCriminal" && (
              <div className="card">
                <h3>Register Criminal</h3>
                <input name="name" placeholder="Name" value={formData.name || ""} onChange={handleChange} />
                <input name="age" type="number" placeholder="Age" value={formData.age || ""} onChange={handleChange} />
                <input name="gender" placeholder="Gender" value={formData.gender || ""} onChange={handleChange} />
                <input name="address" placeholder="Address" value={formData.address || ""} onChange={handleChange} />
                <label>Status</label>
                <select name="status" value={formData.status || "Under Trial"} onChange={handleChange}>
                  <option value="Under Trial">Under Trial</option>
                  <option value="Released">Released</option>
                  <option value="Convicted">Convicted</option>
                </select>
                <button onClick={addCriminal} disabled={loading}>{loading ? "Adding..." : "Add Criminal"}</button>
              </div>
            )}

            {subView === "updateCriminal" && selectedCriminal && (
              <div className="card">
                <h3>Update Criminal</h3>
                <input name="name" placeholder="Name" value={formData.name || ""} onChange={handleChange} />
                <input name="age" type="number" placeholder="Age" value={formData.age || ""} onChange={handleChange} />
                <input name="gender" placeholder="Gender" value={formData.gender || ""} onChange={handleChange} />
                <input name="address" placeholder="Address" value={formData.address || ""} onChange={handleChange} />
                <label>Status</label>
                <select name="status" value={formData.status || ""} onChange={handleChange}>
                  <option value="Under Trial">Under Trial</option>
                  <option value="Released">Released</option>
                  <option value="Convicted">Convicted</option>
                </select>
                <button onClick={updateCriminal} disabled={loading}>{loading ? "Updating..." : "Update Criminal"}</button>
              </div>
            )}

            {subView === "retrieveCriminal" && (
              <div className="card">
                <h3>Criminals</h3>
                <div className="table-container">
                  <table>
                    <thead><tr><th>ID</th><th>Name</th><th>Age</th><th>Gender</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {criminals.map((c) => (
                        <tr key={c.criminal_id}>
                          <td>{c.criminal_id}</td>
                          <td>{c.name}</td>
                          <td>{c.age}</td>
                          <td>{c.gender}</td>
                          <td>{c.status}</td>
                          <td>
                            <button onClick={() => selectCriminalForEdit(c)}>Edit</button>
                            <button onClick={() => deleteCriminal(c.criminal_id)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* OPERATOR MANAGEMENT */}
        {activeTab === "operators" && (
          <div>
            {/* Landing boxes */}
            {!subView && (
              <div className="button-grid" style={{ marginBottom: 20 }}>
                <div className="card" onClick={() => setSubView("addOperator")} style={{ cursor: "pointer" }}>
                  <h3>Add Operator</h3>
                  <p>Create a new user (admin/police/court)</p>
                </div>
                <div className="card" onClick={() => { setSubView("retrieveOperator"); fetchOperators(); }} style={{ cursor: "pointer" }}>
                  <h3>Retrieve Operators</h3>
                  <p>View and manage operators</p>
                </div>
              </div>
            )}

            {/* Add Operator (same as signup) */}
            {subView === "addOperator" && (
              <div className="card">
                <h3>Add Operator</h3>
                <input name="name" placeholder="Full name" value={formData.name || ""} onChange={handleChange} />
                <input name="username" placeholder="Username" value={formData.username || ""} onChange={handleChange} />
                <input name="password" type="password" placeholder="Password" value={formData.password || ""} onChange={handleChange} />
                <label>Role</label>
                <select name="role" value={formData.role || "police"} onChange={handleChange}>
                  <option value="admin">Admin</option>
                  <option value="police">Police</option>
                  <option value="court">Court</option>
                </select>
                <button onClick={addOperator} disabled={loading}>{loading ? "Adding..." : "Add Operator"}</button>
              </div>
            )}

            {/* Edit Operator */}
            {subView === "editOperator" && selectedOperator && (
              <div className="card">
                <h3>Edit Operator</h3>
                <input name="name" placeholder="Full name" value={formData.name || ""} onChange={handleChange} />
                <input name="username" placeholder="Username" value={formData.username || ""} onChange={handleChange} />
                <input name="password" type="password" placeholder="Password (leave blank to keep)" value={formData.password || ""} onChange={handleChange} />
                <label>Role</label>
                <select name="role" value={formData.role || "police"} onChange={handleChange}>
                  <option value="admin">Admin</option>
                  <option value="police">Police</option>
                  <option value="court">Court</option>
                </select>
                <button onClick={updateOperator} disabled={loading}>{loading ? "Updating..." : "Update Operator"}</button>
              </div>
            )}

            {/* Retrieve Operators */}
            {subView === "retrieveOperator" && (
              <div className="card">
                <h3>Operators</h3>
                <div className="table-container">
                  <table>
                    <thead><tr><th>ID</th><th>Username</th><th>Name</th><th>Role</th><th>Actions</th></tr></thead>
                    <tbody>
                      {operators.map((op) => (
                        <tr key={op.user_id}>
                          <td>{op.user_id}</td>
                          <td>{op.username}</td>
                          <td>{op.name}</td>
                          <td>{op.role}</td>
                          <td>
                            <button onClick={() => selectOperatorForEdit(op)}>Edit</button>
                            <button onClick={() => deleteOperator(op.user_id)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
