import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from './Navbar';
import { DarkModeContext } from './DarkModeContext'; 

const ViewProfile = () => {
  const { id } = useParams(); // Get the user ID from the URL
  const [profile, setProfile] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const { darkMode, setDarkMode } = useContext(DarkModeContext); 

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:4000/api/view-profile/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((response) => {
        console.log(id);
        if (response.status === 401) {
          alert('Unauthorized. Please log in.');
          return;
        }
        return response.json();
      })
      .then((data) => {
        if (data) {
          setProfile(data);
        } else {
          alert('Profile not found');
        }
      })
      .catch((error) => {
        console.error('Error fetching profile:', error);
      });
  }, [id]);

  // getting list of users who current user has blocked
  useEffect(() => {
    const fetchBlocked = () => {
      const token = localStorage.getItem('token');
      fetch('http://localhost:4000/api/blocked', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (response.status === 401) {
            alert('Unauthorized. Please log in.');
            return;
          }
          return response.json();
        })
        .then((data) => {
          if (data.success) {
            console.log("blocked: ", data.blocked)
            setIsBlocked(String(data.blocked).includes(String(id)))
          } else {
            console.error('Error fetching blocked users:', data.message);
          }
        })
        .catch((error) => {
          console.error('Error fetching blocked users:', error);
        });
    };
    fetchBlocked();
  }, [id]);


  useEffect(() => {
    const fetchFriendStatus = () => {
      const token = localStorage.getItem('token');
      fetch(`http://localhost:4000/api/friendStatus?user2_id=${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.status === 401) {
          alert('Unauthorized. Please log in.');
          return;
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          console.log("friend status: ", data.status[0])
          if (data.status.some(item => item.status === 'pending')) {
            setIsPending(true);
            setIsFriend(false);
          } else if (data.status.some(item => item.status === 'accepted')) {
            setIsPending(false);
            setIsFriend(true);
          } else { //not pending or accepted, so add friend is an option
            setIsPending(false);
            setIsFriend(false);
          }
        } else {
          console.error('Error fetching friend status:', data.message);
        }
      })
      .catch((error) => {
        console.error('Error fetching friend status:', error);
      });
    };
    fetchFriendStatus();
  }, [id]);

  if (!profile) {
    return <p>Loading...</p>;
  }

  // Helper function to handle null values and arrays
const displayValue = (value) => {
    if (Array.isArray(value)) {
      return value.join(', ');  // Join array elements with commas
    }
    return value ? value : 'N/A';  // Handle non-array values
  };
  
  const handleAddFriend = (user2_id) => {
    const token = localStorage.getItem('token');
  
    fetch('http://localhost:4000/api/friend-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ user2_id }),
    })
      .then((response) => {
        if (response.status === 401) {
          alert('Unauthorized. Please log in.');
          return;
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          setIsPending(true);
          console.log("added friend")
        } else {
          alert(data.message);
        }
      })
      .catch((error) => {
        console.error('Error sending friend request:', error);
      });
  };

  //to block a user
  const handleBlockUser = (userId) => {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:4000/api/block`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({userId}) //sending userId to be blocked
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to block user');
        }
        return response.json();
      })
      .then((data) => {
        console.log('User blocked successfully:', data);
        setIsBlocked(true); 
      })
      .catch((error) => {
        console.error('Error blocking user:', error);
      });
  };

  const handleUnblockUser = (userId) => {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:4000/api/unblock`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({userId}) //sending userId to be unblocked
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to unblock user');
        }
        return response.json();
      })
      .then((data) => {
        console.log('User unblocked successfully:', data);
        setIsBlocked(false); 
      })
      .catch((error) => {
        console.error('Error unblocking user:', error);
      });
  };

  const handleRemoveFriend = (friendId) => {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:4000/api/removeFriend/${friendId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setIsFriend(false);
          console.log("Removed friend")
        } else {
          alert('Failed to remove friend');
        }
      })
      .catch((error) => console.error('Error removing friend:', error));
  };

  const handleRemoveRequest = (friendRequestId) => {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:4000/api/removeFriend/${friendRequestId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setIsPending(false);
          console.log("Removed friend request")
        } else {
          alert('Failed to remove friend request');
        }
      })
      .catch((error) => console.error('Error removing friend:', error));
  };


  // Render the component
  return (
    <div>
      <Navbar/>
      <div className="min-h-screen bg-gray-100 p-8">
        <h2 className="text-3xl font-bold mb-6">{displayValue(profile.name)}&apos;s Profile</h2>
        <p><strong>Proficient Languages:</strong> {displayValue(profile.proficient_languages)}</p>
        <p><strong>Learning Languages:</strong> {displayValue(profile.learning_languages)}</p>
        <p><strong>Age:</strong> {displayValue(profile.age)}</p>
        <p><strong>Interests:</strong> {displayValue(profile.interests_hobbies)}</p>
        <p><strong>Timezone:</strong> {displayValue(profile.timezone)}</p>
    
        <div className="flex space-x-4 mt-4"> {/* Add flex and space-y for vertical spacing */}
            {isFriend ? (
              <button
                onClick={() => handleRemoveFriend(id)}
                className="bg-red-500 text-white py-1 px-4 rounded hover:bg-red-600"
              >
                Remove Friend
              </button>
            ) : isPending ? (
              <button
                onClick={() => handleRemoveRequest(id)} //remove friend is same as remove request because it gets rid of the friendship in the database
                className="bg-gray-500 text-white py-1 px-4 rounded hover:bg-gray-600"
              >
                Pending
              </button>
            ) : (
              <button
                onClick={() => handleAddFriend(id)}
                className="bg-green-500 text-white py-1 px-4 rounded hover:bg-green-600"
              >
                Add Friend
              </button>
            )}

            {isBlocked ? (
              <button
                onClick={() => handleUnblockUser(id)}
                className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600"
              >
                Unblock
              </button>
            ) : (
              <button
                onClick={() => handleBlockUser(id)}
                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
              >
                Block
              </button>
            )}

          <Link to="/matching">
            <button className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600">
              Back to Matching
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
  
};

export default ViewProfile;
