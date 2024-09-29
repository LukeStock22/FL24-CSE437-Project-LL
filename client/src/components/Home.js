import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // useNavigate is the new hook
import './Home.css';

const Home = () => {
  const navigate = useNavigate(); // Replacing useHistory with useNavigate
  const [notifications, setNotifications] = useState([]); // Store notifications
  const [showDropdown, setShowDropdown] = useState(false); // Toggle dropdown visibility
  const [unreadCount, setUnreadCount] = useState(0); // Unread notification count
  const [viewProfile, setViewProfile] = useState(null); // Store profile data when "View Profile" is clicked

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

  const handleAction = (notificationId, action) => {
    const token = localStorage.getItem('token'); // Get token from localStorage

    fetch(`http://localhost:4000/api/friend-request/${notificationId}/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Include the token in the Authorization header
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Remove the notification from the list after action is performed
          setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        } else {
          alert(data.message);
        }
      })
      .catch((error) => console.error(`Error ${action}ing friend request:`, error));
  };

  const handleViewProfile = (userId) => {
    const token = localStorage.getItem('token'); // Get token from localStorage

    fetch(`http://localhost:4000/api/profile/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setViewProfile(data); // Store the fetched profile data in state
          alert(`Name: ${data.name}, Languages: ${data.proficient_languages}, Age: ${data.age}`);
        } else {
          alert('Failed to fetch profile');
        }
      })
      .catch((error) => console.error('Error fetching profile:', error));
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear the token from localStorage
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
                  <p>Friend request from {notification.user1_name}</p>
                  <button onClick={() => handleViewProfile(notification.user1_id)} className="notification-action">
                    View Profile
                  </button>
                  <button onClick={() => handleAction(notification.id, 'accept')} className="notification-action">
                    Accept
                  </button>
                  <button onClick={() => handleAction(notification.id, 'reject')} className="notification-action">
                    Reject
                  </button>
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

      {/* Display profile information if viewProfile is set */}
      {viewProfile && (
        <div className="profile-view">
          <h3>{viewProfile.name}'s Profile</h3>
          <p>Proficient Languages: {viewProfile.proficient_languages}</p>
          <p>Learning Languages: {viewProfile.learning_languages}</p>
          <p>Age: {viewProfile.age}</p>
        </div>
      )}
    </div>
  );
};

export default Home;


