// src/components/Notifications.js
import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../context/SocketContext';

const Notifications = () => {
  const { socket, isSocketConnected } = useContext(SocketContext); // Destructure socket and connection status
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch initial notifications on component mount
  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:4000/api/notifications', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (data.success) {
          setNotifications(data.notifications);
          setUnreadCount(data.notifications.length); // Set initial unread count
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    fetchNotifications();
  }, []);

  // Real-time notification listener
  useEffect(() => {
    if (socket && isSocketConnected) {
      const handleNotification = (notification) => {
        setNotifications((prev) => [...prev, notification]);
        setUnreadCount((prev) => prev + 1);
      };

      socket.on('notification', handleNotification); // Listen for notifications

      return () => {
        socket.off('notification', handleNotification); // Cleanup on unmount
      };
    }
  }, [socket, isSocketConnected]);

  // Real-time incoming call listener
  useEffect(() => {
    if (socket && isSocketConnected) {
      const handleIncomingCall = ({ callerSocketId, callerName }) => {
        const newCallNotification = {
          id: callerSocketId,
          type: 'call',
          name: callerName,
          message: `${callerName} is calling you!`,
        };
        setNotifications((prev) => [...prev, newCallNotification]);
        setUnreadCount((prev) => prev + 1);
      };

      socket.on('incoming-call', handleIncomingCall); // Listen for incoming calls

      return () => {
        socket.off('incoming-call', handleIncomingCall); // Cleanup on unmount
      };
    }
  }, [socket, isSocketConnected]);

  // Accept call notification
  const handleAcceptCall = (notification) => {
    if (socket && isSocketConnected) {
      socket.emit('join-call', { callerSocketId: notification.id });
      navigate('/video-call', { state: { roomName: `VideoCall-${notification.id}` } });
      handleDismiss(notification.id);
    }
  };

  // Friend request actions (accept or reject)
  const handleFriendRequestAction = async (notificationId, action) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(
        `http://localhost:4000/api/friend-request/${notificationId}/${action}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(`Error ${action}ing friend request:`, error);
    }
  };

  // Dismiss a notification
  const handleDismiss = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((prev) => Math.max(0, unreadCount - 1));
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Notifications ({unreadCount})</h2>
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <div key={notification.id} className="mb-2 p-2 border-b">
            {notification.type === 'call' ? (
              <>
                <p className="text-sm mb-2">{notification.message}</p>
                <button
                  onClick={() => handleAcceptCall(notification)}
                  className="bg-green-500 text-white py-1 px-2 rounded mr-2 hover:bg-green-600"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleDismiss(notification.id)}
                  className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600"
                >
                  Dismiss
                </button>
              </>
            ) : (
              <>
                <p className="text-sm mb-2">Friend request from {notification.user1_name}</p>
                <button
                  onClick={() => handleFriendRequestAction(notification.id, 'accept')}
                  className="bg-blue-500 text-white py-1 px-2 rounded mr-2 hover:bg-blue-600"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleFriendRequestAction(notification.id, 'reject')}
                  className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600"
                >
                  Reject
                </button>
              </>
            )}
          </div>
        ))
      ) : (
        <p className="text-sm">No new notifications</p>
      )}
    </div>
  );
};

export default Notifications;
