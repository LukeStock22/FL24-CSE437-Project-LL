import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [viewProfile, setViewProfile] = useState(null);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:4000/api/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setUsername(data.name);
        } else {
          alert('Failed to fetch username');
        }
        setLoading(false); // Data is fetched, stop loading
      })
      .catch((error) => {
        console.error('Error fetching username:', error);
        setLoading(false); // Stop loading even if there's an error
      });
  }, []);

  useEffect(() => {
    const fetchNotifications = () => {
      const token = localStorage.getItem('token');
      fetch('http://localhost:4000/api/notifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setNotifications(data);
          setUnreadCount(data.length);
        })
        .catch((error) => {
          console.error('Error fetching notifications:', error);
        });
    };

    fetchNotifications();
  }, []);

  const handleAction = (notificationId, action) => {
    const token = localStorage.getItem('token');

    fetch(`http://localhost:4000/api/friend-request/${notificationId}/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        } else {
          alert(data.message);
        }
      })
      .catch((error) => console.error(`Error ${action}ing friend request:`, error));
  };

  const handleViewProfile = (userId) => {
    const token = localStorage.getItem('token');

    fetch(`http://localhost:4000/api/profile/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setViewProfile(data);
          alert(`Name: ${data.name}, Languages: ${data.proficient_languages}, Age: ${data.age}`);
        } else {
          alert('Failed to fetch profile');
        }
      })
      .catch((error) => console.error('Error fetching profile:', error));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    setUnreadCount(0);
  };

  // If loading is true, show a loading message or spinner
  if (loading) {
    return <div className="text-center text-2xl">{/*Loading...*/}</div>;
  }

  return (
    <div className="flex flex-col items-center p-8 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6">Welcome, {username}!</h2>

      {/* Notifications Button */}
      <div className="mb-4">
        <button
          onClick={toggleDropdown}
          className="relative bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Notifications
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown List */}
        {showDropdown && (
          <div className="absolute mt-2 bg-white border border-gray-300 rounded shadow-md p-4 w-64">
            <h4 className="font-bold mb-2">Notifications</h4>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div key={notification.id} className="mb-2 p-2 border-b">
                  <p className="text-sm mb-2">Friend request from {notification.user1_name}</p>
                  <button
                    onClick={() => handleViewProfile(notification.user1_id)}
                    className="bg-green-500 text-white py-1 px-2 rounded mr-2 hover:bg-green-600"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => handleAction(notification.id, 'accept')}
                    className="bg-blue-500 text-white py-1 px-2 rounded mr-2 hover:bg-blue-600"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleAction(notification.id, 'reject')}
                    className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm">No new notifications</p>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="space-x-4">
        <button onClick={handleLogout} className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600">
          Logout
        </button>
        <Link to="/edit-profile">
          <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Edit Profile</button>
        </Link>
        <Link to="/messages">
          <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Check Messages</button>
        </Link>
        <Link to="/matching">
          <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Find Matches</button>
        </Link>
      </div>

      {/* Display profile information if viewProfile is set */}
      {viewProfile && (
        <div className="mt-8 p-4 bg-white rounded shadow-md w-full max-w-md">
          <h3 className="text-xl font-bold mb-2">{viewProfile.name}'s Profile</h3>
          <p className="text-sm mb-2">Proficient Languages: {viewProfile.proficient_languages}</p>
          <p className="text-sm mb-2">Learning Languages: {viewProfile.learning_languages}</p>
          <p className="text-sm">Age: {viewProfile.age}</p>
        </div>
      )}
    </div>
  );
};

export default Home;
