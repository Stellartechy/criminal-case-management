import { useState, useEffect } from "react";
import "./PoliceDashboard.css";

function PoliceDashboard({ user }) {
  const [profile, setProfile] = useState({});
  const [criminals, setCriminals] = useState([]);
  const [cases, setCases] = useState([]);
  const [filters, setFilters] = useState({ station: "", crime: "", age: "" });
  const [showRegisterCase, setShowRegisterCase] = useState(false);
  const [showAddCriminal, setShowAddCriminal] = useState(false);
  const [newCase, setNewCase] = useState({
    criminal_id: "",
    officer_id: user?.user_id || "",
    case_status: "Open",
    case_date: "",
  });
  const [newCriminal, setNewCriminal] = useState({
    name: "",
    age: "",
    gender: "",
    address: "",
    status: "Under Trial",
  });

  // Initialize profile and fetch data
  useEffect(() => {
    if (user) {
      setProfile(user);
      fetchCriminals();
      fetchCases();
      setNewCase({ ...newCase, officer_id: user.user_id });
    }
    // eslint-disable-next-line
  }, [user]);

  // Fetch criminals with optional filters
  const fetchCriminals = async () => {
    try {
      let query = new URLSearchParams();
      if (filters.station) query.append("station", filters.station);
      if (filters.crime) query.append("crime", filters.crime);
      if (filters.age) query.append("age", filters.age);

      const res = await fetch(`http://localhost:8000/police/criminals?${query}`);
      if (!res.ok) throw new Error("Failed to fetch criminals");
      const data = await res.json();
      setCriminals(data);
    } catch (err) {
      console.error(err);
      alert("Error fetching criminals");
    }
  };

  // Fetch assigned cases
  const fetchCases = async () => {
    try {
      const res = await fetch(`http://localhost:8000/police/cases`);
      if (!res.ok) throw new Error("Failed to fetch cases");
      const data = await res.json();
      setCases(data);
    } catch (err) {
      console.error(err);
      alert("Error fetching cases");
    }
  };

  // Handle filter input changes
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Apply filters
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchCriminals();
  };

  // Handle new case input changes
  const handleNewCaseChange = (e) => {
    setNewCase({ ...newCase, [e.target.name]: e.target.value });
  };

  // Handle new criminal input changes
  const handleNewCriminalChange = (e) => {
    setNewCriminal({ ...newCriminal, [e.target.name]: e.target.value });
  };

  // Submit new criminal
  const handleAddCriminal = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/criminals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCriminal),
      });
      if (!res.ok) throw new Error("Failed to add criminal");
      const data = await res.json();
      alert(`Criminal ${data.name} added successfully!`);
      fetchCriminals();
      setShowAddCriminal(false);
      setNewCriminal({
        name: "",
        age: "",
        gender: "",
        address: "",
        status: "Under Trial",
      });
    } catch (err) {
      console.error(err);
      alert("Error adding criminal");
    }
  };

  // Submit new case
  const handleRegisterCase = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCase),
      });
      if (!res.ok) throw new Error("Failed to register case");
      const data = await res.json();
      alert("Case registered successfully!");
      setShowRegisterCase(false);
      fetchCases();
    } catch (err) {
      console.error(err);
      alert("Error registering case. Make sure the criminal exists.");
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2>Police Dashboard</h2>
        <ul>
          <li className="active">Profile</li>
          <li>
            <button onClick={() => setShowRegisterCase(!showRegisterCase)}>
              Register Case
            </button>
          </li>
          <li>
            <button onClick={() => setShowAddCriminal(!showAddCriminal)}>
              Register Criminal
            </button>
          </li>
          <li>Update Case</li>
          <li>View Statistics</li>
        </ul>
      </div>

      <div className="main-content">
        <h2>Welcome, {profile.username}</h2>

        {/* Profile Card */}
        <div className="profile-card">
          <p><strong>Role:</strong> {profile.role}</p>
          <p><strong>User ID:</strong> {profile.user_id}</p>
        </div>

        {/* Register Criminal Form */}
        {showAddCriminal && (
          <div className="register-criminal">
            <h3>Add New Criminal</h3>
            <form onSubmit={handleAddCriminal}>
              <input
                type="text"
                name="name"
                value={newCriminal.name}
                placeholder="Name"
                onChange={handleNewCriminalChange}
                required
              />
              <input
                type="number"
                name="age"
                value={newCriminal.age}
                placeholder="Age"
                onChange={handleNewCriminalChange}
              />
              <input
                type="text"
                name="gender"
                value={newCriminal.gender}
                placeholder="Gender"
                onChange={handleNewCriminalChange}
              />
              <input
                type="text"
                name="address"
                value={newCriminal.address}
                placeholder="Address"
                onChange={handleNewCriminalChange}
              />
              <select
                name="status"
                value={newCriminal.status}
                onChange={handleNewCriminalChange}
              >
                <option value="Under Trial">Under Trial</option>
                <option value="Released">Released</option>
                <option value="Convicted">Convicted</option>
              </select>
              <button type="submit">Add Criminal</button>
            </form>
          </div>
        )}

        {/* Register Case Form */}
        {showRegisterCase && (
          <div className="register-case">
            <h3>Register New Case</h3>
            <form onSubmit={handleRegisterCase}>
              <select
                name="criminal_id"
                value={newCase.criminal_id}
                onChange={handleNewCaseChange}
                required
              >
                <option value="">Select Criminal</option>
                {criminals.map((c) => (
                  <option key={c.criminal_id} value={c.criminal_id}>
                    {c.name} ({c.criminal_id})
                  </option>
                ))}
              </select>
              <input
                type="date"
                name="case_date"
                value={newCase.case_date}
                onChange={handleNewCaseChange}
                required
              />
              <select
                name="case_status"
                value={newCase.case_status}
                onChange={handleNewCaseChange}
              >
                <option value="Open">Open</option>
                <option value="In Court">In Court</option>
                <option value="Closed">Closed</option>
              </select>
              <button type="submit">Register Case</button>
            </form>
          </div>
        )}

        {/* Filters Section */}
        <form className="filter-section" onSubmit={handleFilterSubmit}>
          <input
            type="text"
            name="station"
            placeholder="Station"
            value={filters.station}
            onChange={handleFilterChange}
          />
          <input
            type="text"
            name="crime"
            placeholder="Crime Type"
            value={filters.crime}
            onChange={handleFilterChange}
          />
          <input
            type="number"
            name="age"
            placeholder="Age"
            value={filters.age}
            onChange={handleFilterChange}
          />
          <button type="submit">Apply Filters</button>
        </form>

        {/* Criminals Table */}
        <h3>Criminals List</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Address</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {criminals.length > 0 ? (
              criminals.map((c) => (
                <tr key={c.criminal_id}>
                  <td>{c.criminal_id}</td>
                  <td>{c.name}</td>
                  <td>{c.age}</td>
                  <td>{c.gender}</td>
                  <td>{c.address}</td>
                  <td>{c.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No criminals found</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Assigned Cases Table */}
        <h3>Assigned Cases</h3>
        <table>
          <thead>
            <tr>
              <th>Case ID</th>
              <th>Criminal</th>
              <th>Status</th>
              <th>Officer</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {cases.length > 0 ? (
              cases.map((caseItem) => (
                <tr key={caseItem.case_id}>
                  <td>{caseItem.case_id}</td>
                  <td>{caseItem.criminal?.name || "N/A"}</td>
                  <td>{caseItem.case_status}</td>
                  <td>{caseItem.officer?.name || "N/A"}</td>
                  <td>{caseItem.case_date}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No assigned cases</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PoliceDashboard;
