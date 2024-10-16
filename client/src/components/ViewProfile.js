import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const ViewProfile = () => {
  const { id } = useParams(); // Get the user ID from the URL
  const [profile, setProfile] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);

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
          //change button to pending, not add friend
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


  // Render the component
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h2 className="text-3xl font-bold mb-6">{displayValue(profile.name)}&apos;s Profile</h2>
      <p><strong>Proficient Languages:</strong> {displayValue(profile.proficient_languages)}</p>
      <p><strong>Learning Languages:</strong> {displayValue(profile.learning_languages)}</p>
      <p><strong>Age:</strong> {displayValue(profile.age)}</p>
      <p><strong>Interests:</strong> {displayValue(profile.interests_hobbies)}</p>
  
      <div className="flex space-x-4 mt-4"> {/* Add flex and space-y for vertical spacing */}
        <button
            onClick={() => handleAddFriend(id)}
            className="bg-green-500 text-white py-1 px-4 rounded hover:bg-green-600"
          >
            Add Friend
          </button>

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
        <Link to="/home">
          <button className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600">
            Home
          </button>
        </Link>
      </div>

    </div>
  );
  
};

export default ViewProfile;
