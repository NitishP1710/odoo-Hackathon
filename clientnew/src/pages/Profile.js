import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import './Profile.css';

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { addNotification } = useNotifications();

  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('questions');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    bio: ''
  });

  const isOwnProfile = !userId || (currentUser && currentUser._id === userId);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const targetUserId = userId || currentUser?._id;
      if (!targetUserId) {
        setError('User not found');
        return;
      }

      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [userResponse, questionsResponse, answersResponse] = await Promise.all([
        axios.get(`${API_URL}/api/users/${targetUserId}`, { headers }),
        axios.get(`${API_URL}/api/users/${targetUserId}/questions`, { headers }),
        axios.get(`${API_URL}/api/users/${targetUserId}/answers`, { headers })
      ]);

      setUser(userResponse.data);
      setQuestions(questionsResponse.data);
      setAnswers(answersResponse.data);
      setEditForm({
        username: userResponse.data.username,
        email: userResponse.data.email,
        bio: userResponse.data.bio || ''
      });
    } catch (err) {
      setError('User not found');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/api/users/${user._id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(response.data);
      setEditing(false);
      addNotification('Profile updated successfully', 'success');
    } catch (err) {
      addNotification(err.response?.data?.message || 'Error updating profile', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/users/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      localStorage.removeItem('token');
      navigate('/');
      addNotification('Account deleted successfully', 'success');
    } catch (err) {
      addNotification(err.response?.data?.message || 'Error deleting account', 'error');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getVoteCount = (voteObj) => {
    return (voteObj?.upvotes || 0) - (voteObj?.downvotes || 0);
  };

  const getReputation = () => {
    const questionVotes = questions.reduce((sum, q) => sum + getVoteCount(q.votes), 0);
    const answerVotes = answers.reduce((sum, a) => sum + getVoteCount(a.votes), 0);
    const acceptedAnswers = answers.filter(a => a.isAccepted).length;
    return questionVotes + answerVotes + (acceptedAnswers * 15);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error || !user) return <div className="error">{error || 'User not found'}</div>;

  return (
    <div className="profile">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-info">
            <div className="avatar">{user.username.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <h1>{user.username}</h1>
              <p className="user-role">{user.role}</p>
              {user.bio && <p className="user-bio">{user.bio}</p>}
              <div className="user-stats">
                <span>Reputation: {getReputation()}</span>
                <span>Member since: {formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>

          {isOwnProfile && (
            <div className="profile-actions">
              <button className="btn-secondary" onClick={() => setEditing(!editing)}>
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
              <button className="btn-danger" onClick={handleDeleteAccount}>
                Delete Account
              </button>
            </div>
          )}
        </div>

        {/* Edit Form */}
        {editing && isOwnProfile && (
          <div className="edit-form">
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  rows="4"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        )}

        {/* Activity Tabs */}
        <div className="activity-section">
          <div className="tabs">
            <button className={`tab ${activeTab === 'questions' ? 'active' : ''}`} onClick={() => setActiveTab('questions')}>
              Questions ({questions.length})
            </button>
            <button className={`tab ${activeTab === 'answers' ? 'active' : ''}`} onClick={() => setActiveTab('answers')}>
              Answers ({answers.length})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'questions' && (
              <div className="questions-list">
                {questions.length === 0 ? (
                  <p className="no-content">No questions yet.</p>
                ) : (
                  questions.map(question => (
                    <div key={question._id} className="activity-item">
                      <div className="item-stats">
                        <div className="stat">
                          <span className="stat-number">{getVoteCount(question.votes)}</span>
                          <span className="stat-label">votes</span>
                        </div>
                        <div className="stat">
                          <span className="stat-number">{question.answers?.length || 0}</span>
                          <span className="stat-label">answers</span>
                        </div>
                        <div className="stat">
                          <span className="stat-number">{question.views}</span>
                          <span className="stat-label">views</span>
                        </div>
                      </div>

                      <div className="item-content">
                        <h3 className="item-title" onClick={() => navigate(`/question/${question._id}`)}>
                          {question.title}
                        </h3>
                        <div className="item-meta">
                          <span>{formatDate(question.createdAt)}</span>
                          {question.tags?.map(tag => (
                            <span key={tag._id} className="tag">{tag.name}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'answers' && (
              <div className="answers-list">
                {answers.length === 0 ? (
                  <p className="no-content">No answers yet.</p>
                ) : (
                  answers.map(answer => (
                    <div key={answer._id} className="activity-item">
                      <div className="item-stats">
                        <div className="stat">
                          <span className="stat-number">{getVoteCount(answer.votes)}</span>
                          <span className="stat-label">votes</span>
                        </div>
                        {answer.isAccepted && (
                          <div className="stat accepted">
                            <span className="stat-number">✓</span>
                            <span className="stat-label">accepted</span>
                          </div>
                        )}
                      </div>

                      <div className="item-content">
                        <h3 className="item-title" onClick={() => navigate(`/question/${answer.question._id}`)}>
                          {answer.question.title}
                        </h3>
                        <div className="answer-preview">
                          {answer.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                        </div>
                        <div className="item-meta">
                          <span>{formatDate(answer.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
