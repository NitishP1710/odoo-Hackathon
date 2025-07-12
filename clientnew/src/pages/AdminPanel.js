import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import './AdminPanel.css';


const AdminPanel = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [reportedContent, setReportedContent] = useState([]);
  const [users, setUsers] = useState([]);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [moderationQueue, setModerationQueue] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [statsResponse, reportsResponse, usersResponse, queueResponse] = await Promise.all([
        axios.get(`${API_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/admin/reports`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/admin/moderation-queue`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setStats(statsResponse.data);
      setReportedContent(reportsResponse.data);
      setUsers(usersResponse.data);
      setModerationQueue(queueResponse.data);
    } catch (err) {
      addNotification('Error fetching admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleModerateContent = async (contentId, action, contentType) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/admin/moderate`, {
        contentId,
        action,
        contentType
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      addNotification(`Content ${action} successfully`, 'success');
      fetchDashboardData();
    } catch (err) {
      addNotification(err.response?.data?.message || 'Error moderating content', 'error');
    }
  };

  const handleBanUser = async (userId, banStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/admin/users/${userId}/ban`, {
        banned: banStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      addNotification(`User ${banStatus ? 'banned' : 'unbanned'} successfully`, 'success');
      fetchDashboardData();
    } catch (err) {
      addNotification(err.response?.data?.message || 'Error updating user status', 'error');
    }
  };

  const handleChangeUserRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/admin/users/${userId}/role`, {
        role: newRole
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      addNotification('User role updated successfully', 'success');
      fetchDashboardData();
    } catch (err) {
      addNotification(err.response?.data?.message || 'Error updating user role', 'error');
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/admin/broadcast`, {
        message: broadcastMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      addNotification('Broadcast message sent successfully', 'success');
      setBroadcastMessage('');
    } catch (err) {
      addNotification(err.response?.data?.message || 'Error sending broadcast', 'error');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Loading admin panel...</div>;
  }

  return (
    <div className="admin-panel">
      <div className="admin-container">
        <div className="admin-header">
          <h1>Admin Panel</h1>
          <p>Welcome back, {user?.username}</p>
        </div>

        <div className="admin-tabs">
          <button 
            className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`tab ${activeTab === 'moderation' ? 'active' : ''}`}
            onClick={() => setActiveTab('moderation')}
          >
            Moderation
          </button>
          <button 
            className={`tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            User Management
          </button>
          <button 
            className={`tab ${activeTab === 'broadcast' ? 'active' : ''}`}
            onClick={() => setActiveTab('broadcast')}
          >
            Broadcast
          </button>
        </div>

        <div className="tab-content">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="dashboard">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Users</h3>
                  <div className="stat-number">{stats.totalUsers || 0}</div>
                </div>
                <div className="stat-card">
                  <h3>Total Questions</h3>
                  <div className="stat-number">{stats.totalQuestions || 0}</div>
                </div>
                <div className="stat-card">
                  <h3>Total Answers</h3>
                  <div className="stat-number">{stats.totalAnswers || 0}</div>
                </div>
                <div className="stat-card">
                  <h3>Pending Reports</h3>
                  <div className="stat-number">{stats.pendingReports || 0}</div>
                </div>
              </div>

              <div className="recent-activity">
                <h3>Recent Reports</h3>
                <div className="reports-list">
                  {reportedContent.slice(0, 5).map(report => (
                    <div key={report._id} className="report-item">
                      <div className="report-info">
                        <span className="report-type">{report.contentType}</span>
                        <span className="report-reason">{report.reason}</span>
                        <span className="report-date">{formatDate(report.createdAt)}</span>
                      </div>
                      <div className="report-actions">
                        <button 
                          className="btn-secondary"
                          onClick={() => handleModerateContent(report.contentId, 'approve', report.contentType)}
                        >
                          Approve
                        </button>
                        <button 
                          className="btn-danger"
                          onClick={() => handleModerateContent(report.contentId, 'reject', report.contentType)}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Moderation Tab */}
          {activeTab === 'moderation' && (
            <div className="moderation">
              <h3>Moderation Queue</h3>
              <div className="moderation-list">
                {moderationQueue.map(item => (
                  <div key={item._id} className="moderation-item">
                    <div className="item-content">
                      <h4>{item.title || 'Content Preview'}</h4>
                      <p>{item.content?.substring(0, 200)}...</p>
                      <div className="item-meta">
                        <span>Type: {item.contentType}</span>
                        <span>Author: {item.author?.username}</span>
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </div>
                    <div className="moderation-actions">
                      <button 
                        className="btn-secondary"
                        onClick={() => handleModerateContent(item._id, 'approve', item.contentType)}
                      >
                        Approve
                      </button>
                      <button 
                        className="btn-danger"
                        onClick={() => handleModerateContent(item._id, 'reject', item.contentType)}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
                {moderationQueue.length === 0 && (
                  <p className="no-content">No content pending moderation.</p>
                )}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="users">
              <h3>User Management</h3>
              <div className="users-list">
                {users.map(user => (
                  <div key={user._id} className="user-item">
                    <div className="user-info">
                      <h4>{user.username}</h4>
                      <p>Email: {user.email}</p>
                      <p>Role: {user.role}</p>
                      <p>Joined: {formatDate(user.createdAt)}</p>
                      {user.banned && <span className="banned-badge">BANNED</span>}
                    </div>
                    <div className="user-actions">
                      <select 
                        value={user.role}
                        onChange={(e) => handleChangeUserRole(user._id, e.target.value)}
                        className="role-select"
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button 
                        className={user.banned ? "btn-secondary" : "btn-danger"}
                        onClick={() => handleBanUser(user._id, !user.banned)}
                      >
                        {user.banned ? 'Unban' : 'Ban'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Broadcast Tab */}
          {activeTab === 'broadcast' && (
            <div className="broadcast">
              <h3>Send Broadcast Message</h3>
              <form onSubmit={handleBroadcast}>
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="Enter your broadcast message..."
                    rows="6"
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    Send Broadcast
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 