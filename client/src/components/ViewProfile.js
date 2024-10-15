import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const ViewProfile = () => {
  const { id } = useParams(); // Get the user ID from the URL
  const [profile, setProfile] = useState(null);

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
          // Immediately update the match's friend status to 'pending'
          // setMatches((prevMatches) => 
          //   prevMatches.map((match) => 
          //     match.id === user2_id ? { ...match, friend_status: 'pending' } : match
          //   )
          // );
          console.log("added friend")
        } else {
          alert(data.message);
        }
      })
      .catch((error) => {
        console.error('Error sending friend request:', error);
      });
  };

  // const handleBlockUser = (user2_id) => {
  //   const token = localStorage.getItem('token');

  //   fetch(`http://localhost:4000/api/block`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Authorization': `Bearer ${token}`,
  //     },
  //     body: JSON.stringify({user2_id}) //sending userId to be blocked
  //   })
  //     .then((response) => {
  //       if (!response.ok) {
  //         throw new Error('Failed to block user');
  //       }
  //       return response.json();
  //     })
  //     .then((data) => {
  //       console.log('User blocked successfully:', data); 
  //     })
  //     .catch((error) => {
  //       console.error('Error blocking user:', error);
  //     });
  // };


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
          {/* <button
            onClick={() => handleBlockUser(id)}
            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
          >
            Block
          </button> */}
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
