import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [content, setContent] = useState([]);

  // Fetch user-generated content on component mount
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get('/api/content');
        setContent(response.data);
      } catch (err) {
        setError('Failed to fetch content');
        console.error(err);
      }
    };
    fetchContent();
  }, []);

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

  const handleApprove = async (contentId) => {
    try {
      const response = await axios.put(`/api/content/${contentId}/approve`);
      setContent(content.map(item => item._id === contentId ? response.data : item));
      console.log(`Successfully approved content with ID: ${contentId}`);
    } catch (err) {
      setError('Failed to approve content');
      console.error(err);
    }
  };

  const handleReject = async (contentId) => {
    try {
      const response = await axios.put(`/api/content/${contentId}/reject`);
      setContent(content.map(item => item._id === contentId ? response.data : item));
      console.log(`Successfully rejected content with ID: ${contentId}`);
    } catch (err) {
      setError('Failed to reject content');
      console.error(err);
    }
  };

  const handleDeleteContent = async (contentId) => {
    try {
      await axios.delete(`/api/content/${contentId}`);
      setContent(content.filter(item => item._id !== contentId));
      console.log(`Successfully deleted content with ID: ${contentId}`);
    } catch (err) {
      setError('Failed to delete content');
      console.error(err);
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="dashboard-content">
        <p>Welcome to the Admin Dashboard</p>
        {/* Analytics Section */}
        <div className="analytics-section">
          <h2>Analytics</h2>
          <div className="analytics-grid">
            <div className="analytics-card">
              <h3>User Activity</h3>
              <canvas id="userActivityChart"></canvas>
            </div>
            <div className="analytics-card">
              <h3>Content Statistics</h3>
              <canvas id="contentStatsChart"></canvas>
            </div>
            <div className="analytics-card">
              <h3>System Performance</h3>
              <canvas id="systemPerformanceChart"></canvas>
            </div>
          </div>
        </div>
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
                    <button className="edit-btn" onClick={() => handleEdit(user._id)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(user._id)}>Delete</button>
                    <button className="ban-btn" onClick={() => handleBan(user._id)}>Ban</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Content Moderation Table */}
        <div className="content-moderation">
          <h2>Content Moderation</h2>
          <table className="content-table">
            <thead>
              <tr>
                <th>Content Type</th>
                <th>Author</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {content.map(item => (
                <tr key={item._id}>
                  <td>{item.type}</td>
                  <td>{`${item.author.firstName} ${item.author.lastName}`}</td>
                  <td>{item.status}</td>
                  <td>
                    <button className="approve-btn" onClick={() => handleApprove(item._id)}>Approve</button>
                    <button className="reject-btn" onClick={() => handleReject(item._id)}>Reject</button>
                    <button className="delete-btn" onClick={() => handleDeleteContent(item._id)}>Delete</button>
                    <button className="flag-btn" onClick={() => handleFlagContent(item._id)}>Flag</button>
                  </td>
                </tr>
              ))}
              {error && <div className="error-message">{error}</div>}
            </tbody>
          </table>
        </div>
        {/* Topic Management Section */}
        <div className="topic-management">
          <h2>Topic Management</h2>
          <div className="topics-list">
            {['General', 'Immigration Updates', 'Community Support'].map((topic) => (
              <div key={topic} className="topic-item">
                <span>{topic}</span>
                <button onClick={() => handleDeleteTopic(topic)}>Delete</button>
              </div>
            ))}
          </div>
          <div className="add-topic">
            <input type="text" placeholder="New topic name" />
            <button onClick={handleAddTopic}>Add Topic</button>
          </div>
        </div>
      </div>
    </div>
      </div>
    </div>
  );
  const handleBan = async (userId) => {
    try {
      const response = await axios.put(`/api/users/${userId}/ban`);
      setUsers(users.map(user => user._id === userId ? response.data : user));
      console.log(`Successfully banned user with ID: ${userId}`);
    } catch (err) {
      setError('Failed to ban user');
      console.error(err);
    }
  };

  const handleFlagContent = async (contentId) => {
    try {
      const response = await axios.put(`/api/content/${contentId}/flag`);
      setContent(content.map(item => item._id === contentId ? response.data : item));
      console.log(`Successfully flagged content with ID: ${contentId}`);
    } catch (err) {
      setError('Failed to flag content');
      console.error(err);
    }
  };

  const handleDeleteTopic = async (topic) => {
    try {
      await axios.delete(`/api/topics/${topic}`);
      console.log(`Successfully deleted topic: ${topic}`);
    } catch (err) {
      setError('Failed to delete topic');
      console.error(err);
    }
  };

  const handleAddTopic = async () => {
    const topicInput = document.querySelector('.add-topic input');
    const topicName = topicInput.value;
    if (!topicName.trim()) return;
    
    try {
      await axios.post('/api/topics', { name: topicName });
      console.log(`Successfully added topic: ${topicName}`);
      topicInput.value = '';
    } catch (err) {
      setError('Failed to add topic');
      console.error(err);
    }
  };
}

export default AdminDashboard;
