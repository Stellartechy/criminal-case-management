import { useState } from "react";
import axios from "axios";

function UpdateOperator() {
  const [userId, setUserId] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "police",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://127.0.0.1:8000/users/${userId}`, formData);
      alert(res.data.message); // ✅ "User updated successfully"
    } catch (err) {
      console.error(err);
      alert("Error updating operator!");
    }
  };

  return (
    <div>
      <h2>Update Operator</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
        <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="admin">Admin</option>
          <option value="police">Police</option>
          <option value="court">Court</option>
        </select>
        <button type="submit">Update</button>
      </form>
    </div>
  );
}
export default UpdateOperator;
