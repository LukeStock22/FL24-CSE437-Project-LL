import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // useNavigate is the new hook
import './Home.css';

const Home = () => {
  const navigate = useNavigate(); // Replacing useHistory with useNavigate
  const [notifications, setNotifications] = useState([]); // Store notifications
  const [showDropdown, setShowDropdown] = useState(false); // Toggle dropdown visibility
  const [unreadCount, setUnreadCount] = useState(0); // Unread notification count

  useEffect(() => {
    const fetchNotifications = () => {
      const token = localStorage.getItem('token'); // Assume token stored in localStorage
      fetch('http://localhost:4000/api/notifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include token in Authorization header
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setNotifications(data); // Set notifications from server response
          setUnreadCount(data.length); // Set unread count as number of notifications
        })
        .catch((error) => {
          console.error('Error fetching notifications:', error);
        });
    };

    fetchNotifications(); // Fetch notifications when the component mounts
  }, []);

  const handleLogout = () => {
    // Clear session or token if needed (e.g., localStorage.removeItem('token'))
    navigate('/'); // Redirecting to login page
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown); // Toggle dropdown on button click
    setUnreadCount(0); // Mark all notifications as read when dropdown is opened
  };

  return (
    <div className="home-container">
      <h2>Welcome to the Home Page</h2>

      {/* Notifications Button */}
      <div className="notifications-container">
        <button onClick={toggleDropdown} className="notifications-button">
          Notifications
          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown List */}
        {showDropdown && (
          <div className="notifications-dropdown">
            <h4>Notifications</h4>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div key={notification.id} className="notification-item">
                  <p>
                    Friend request from {notification.user1_name} {/* Assuming you send user1's name */}
                  </p>
                  <button onClick={() => alert('View Profile clicked')} className="notification-action">View Profile</button>
                  <button onClick={() => alert('Accept clicked')} className="notification-action">Accept</button>
                  <button onClick={() => alert('Reject clicked')} className="notification-action">Reject</button>
                </div>
              ))
            ) : (
              <p>No new notifications</p>
            )}
          </div>
        )}
      </div>

      <button onClick={handleLogout}>Logout</button>
      <Link to="/edit-profile">
        <button>Edit Profile</button>
      </Link>
      <Link to="/messages">
        <button>Check Messages</button>
      </Link>
      <Link to="/matching">
        <button>Find Matches</button>
      </Link>
    </div>
  );
};

export default Home;

