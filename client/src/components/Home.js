import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';


const Home = () => {
 const navigate = useNavigate();
 const [notifications, setNotifications] = useState([]);
 const [showDropdown, setShowDropdown] = useState(false);
 const [unreadCount, setUnreadCount] = useState(0);
 const [viewProfile, setViewProfile] = useState(null);
 const [username, setUsername] = useState('');
 const [friends, setFriends] = useState([]); // Friends list
 const [chats, setChats] = useState([]); // To store chat data for recent messages
 const [loading, setLoading] = useState(true);
 const [showProfileModal, setShowProfileModal] = useState(false);
 const [darkMode, setDarkMode] = useState(true); // Dark mode state


 // Fetch profile info
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
         navigate('/login');
       }
       setLoading(false);
     })
     .catch((error) => {
       console.error('Error fetching username:', error);
       setLoading(false);
     });
 }, []);


 // Fetch notifications and friends
 useEffect(() => {
   const fetchNotificationsAndFriends = () => {
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


     fetch('http://localhost:4000/api/friends', {
       method: 'GET',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}`,
       },
     })
       .then((response) => response.json())
       .then((data) => {
         setFriends(data); // Save friends list
       })
       .catch((error) => {
         console.error('Error fetching friends:', error);
       });


     fetch('http://localhost:4000/api/chats', {
       headers: { 'Authorization': `Bearer ${token}` },
     })
       .then((res) => res.json())
       .then((data) => {
         setChats(data);
       })
       .catch((err) => console.error('Error fetching chats:', err));
   };


   fetchNotificationsAndFriends();
 }, []);


 // Combine friends with their most recent messages
 const getRecentMessage = (friendId) => {
  const chat = chats.find((chat) => chat.friend_id === friendId);
  return chat && chat.last_message ? chat.last_message : 'No messages yet';
};



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
        }
        else {
         alert(data.message);
       }
     })
     .catch((error) => console.error(`Error ${action}ing friend request:`, error));
 };


 const handleViewProfile = (userId) => {
   const token = localStorage.getItem('token');
   fetch(`http://localhost:4000/api/view-profile/${userId}`, {
     headers: {
       'Authorization': `Bearer ${token}`,
     },
   })
     .then((response) => response.json())
     .then((data) => {
       if (data) {
         setViewProfile(data);
         setShowProfileModal(true); // Show the modal
       } else {
         alert('Failed to fetch profile');
       }
     })
     .catch((error) => console.error('Error fetching profile:', error));
 };


 const handleLogout = () => {
   localStorage.removeItem('token');
   navigate('/login');
 };


 const toggleDropdown = () => {
   setShowDropdown(!showDropdown);
   setUnreadCount(0);
 };


 if (loading) {
   return <div className="text-center text-2xl">Loading...</div>;
 }


 return (
   <div className={`flex flex-col min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
     {/* Top Navbar */}
     <div className={`flex justify-between p-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} shadow-md`}>
       <h1 className="text-3xl font-bold">Welcome, {username}!</h1>
       <div className="space-x-4">
         <button
           onClick={() => setDarkMode(!darkMode)}
           className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
         >
           Toggle Dark Mode
           {/*{darkMode ? '☀️' : '🌙'} {/* Sun for dark mode, moon for light mode } */}
         </button>
         <button onClick={handleLogout} className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600">
           Logout
         </button>
         <Link to="/edit-profile">
           <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Edit Profile</button>
         </Link>
       </div>
     </div>


     {/* Main Content */}
     <div className="flex flex-grow mt-4 p-4">
       {/* Friends/Messages Section */}
       <div className={`w-1/4 p-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} shadow-md mr-4`}>
         <h2 className="text-xl font-bold mb-4">Friends/Messages</h2>
         <ul>
           {friends.length > 0 ? (
             friends.map((friend) => (
               <li key={friend.id} className="p-2 border-b">
                 {friend.name} - Last Message: {getRecentMessage(friend.id)}
               </li>
             ))
           ) : (
             <p>No friends added yet</p>
           )}
         </ul>
         <Link to="/messages">
           <button className="mt-2 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
             Check Messages
           </button>
         </Link>
       </div>


       {/* Notifications Section */}
       <div className={`w-1/2 p-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} shadow-md mr-4`}>
         <h2 className="text-xl font-bold mb-4">Notifications</h2>
         <div className="space-y-2">
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
       </div>


       {/* Find Matches Section */}
       <div className={`w-1/4 p-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} shadow-md`}>
         <h2 className="text-xl font-bold mb-4">Find Matches</h2>
         <Link to="/matching">
           <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Add Friends</button>
         </Link>
       </div>
     </div>


     {/* Profile Modal */}
     {showProfileModal && (
       <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
         <div className="bg-white p-6 rounded shadow-lg w-80">
           <h3 className="text-xl font-bold mb-2">{viewProfile.name}'s Profile</h3>
           <p className="text-sm mb-2">Proficient Languages: {viewProfile.proficient_languages}</p>
           <p className="text-sm mb-2">Learning Languages: {viewProfile.learning_languages}</p>
           <p className="text-sm">Age: {viewProfile.age}</p>
           <button
             onClick={() => setShowProfileModal(false)}
             className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
           >
             Close
           </button>
         </div>
       </div>
     )}
   </div>
 );
};


export default Home;
