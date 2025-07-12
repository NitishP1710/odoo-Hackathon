import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification._id);
    setShowNotifications(false);
    
    // Navigate to related content
    if (notification.relatedQuestion) {
      navigate(`/question/${notification.relatedQuestion._id || notification.relatedQuestion}`);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <h1>StackIt</h1>
        </Link>

        <div className="navbar-search">
          <input
            type="text"
            placeholder="Search questions..."
            className="search-input"
          />
          <button className="search-button">
            <i className="fas fa-search"></i>
          </button>
        </div>

        <div className="navbar-menu">
          {user ? (
            <>
              <Link to="/ask" className="ask-button">
                Ask Question
              </Link>

              {/* Notifications */}
              <div className="notification-container">
                <button
                  className="notification-button"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <i className="fas fa-bell"></i>
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </button>

                {showNotifications && (
                  <div className="notification-dropdown">
                    <div className="notification-header">
                      <h3>Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="mark-all-read"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="notification-list">
                      {notifications.length === 0 ? (
                        <p className="no-notifications">No notifications</p>
                      ) : (
                        notifications.slice(0, 10).map((notification) => (
                          <div
                            key={notification._id}
                            className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="notification-content">
                              <h4>{notification.title}</h4>
                              <p>{notification.message}</p>
                              <small>
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </small>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="user-menu-container">
                <button
                  className="user-menu-button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <img
                    src={user.avatar && user.avatar.trim() !== '' ? user.avatar : '/default-avatar.svg'}
                    alt={user.username}
                    className="user-avatar"
                  />
                  <span className="username">{user.username}</span>
                  <i className="fas fa-chevron-down"></i>
                </button>

                {showUserMenu && (
                  <div className="user-dropdown">
                    <Link to="/profile" onClick={() => setShowUserMenu(false)}>
                      <i className="fas fa-user"></i> Profile
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setShowUserMenu(false)}>
                        <i className="fas fa-shield-alt"></i> Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-button">
                Login
              </Link>
              <Link to="/register" className="register-button">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 