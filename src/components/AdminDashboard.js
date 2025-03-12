import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users');
        setUsers(response.data);
      } catch (err) {
        setError('Failed to fetch users');
        console.error(err);
      }
    };
    fetchUsers();
  }, []);
  const handleEdit = async (userId) => {
    try {
      const userToEdit = users.find(user => user._id === userId);
      const updatedUser = {
        ...userToEdit,
        // Example: Change role to 'admin'
        role: 'admin',
      };

      const response = await axios.put(`/api/users/${userId}`, updatedUser);
      setUsers(users.map(user => user._id === userId ? response.data : user));
      console.log(`Successfully updated user with ID: ${userId}`);
    } catch (err) {
      setError('Failed to update user');
      console.error(err);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`/api/users/${userId}`);
      setUsers(users.filter(user => user._id !== userId));
      console.log(`Successfully deleted user with ID: ${userId}`);
    } catch (err) {
      setError('Failed to delete user');
      console.error(err);
    }
  };
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="dashboard-content">
        <p>Welcome to the Admin Dashboard</p>
        {/* User Management Table */}
        <div className="user-management">
          <h2>User Management</h2>
          <table className="user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{`${user.firstName} ${user.lastName}`}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                {error && <div className="error-message">{error}</div>}
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(user.id)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(user.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

