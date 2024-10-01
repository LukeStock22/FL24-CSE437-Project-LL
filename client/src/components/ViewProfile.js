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
  
  // Render the component
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h2 className="text-3xl font-bold mb-6">{displayValue(profile.name)}'s Profile</h2>
      <p><strong>Proficient Languages:</strong> {displayValue(profile.proficient_languages)}</p>
      <p><strong>Learning Languages:</strong> {displayValue(profile.learning_languages)}</p>
      <p><strong>Age:</strong> {displayValue(profile.age)}</p>
      <p><strong>Interests:</strong> {displayValue(profile.interests_hobbies)}</p>
  
      <Link to="/matching">
        <button className="mt-6 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600">
          Back to Matching
        </button>
      </Link>
    </div>
  );
  
};

export default ViewProfile;
