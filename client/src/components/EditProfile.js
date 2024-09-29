import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate

const EditProfile = () => {
    const navigate = useNavigate(); // Use the hook here
    const [profile, setProfile] = useState({
        name: '',
        proficientLanguages: '',
        learningLanguages: '',
        timezone: '',
        interests: '',
        age: ''
    });

    // Fetch the profile data from the server
    useEffect(() => {
      const fetchProfile = async () => {
        const token = localStorage.getItem('token');
        console.log('Token:', token);
    
        const res = await fetch('http://localhost:4000/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
    
        const data = await res.json();
    
        if (res.ok && data.success) {
          setProfile({
            name: data.name || '',
            proficientLanguages: data.proficient_languages || '',
            learningLanguages: data.learning_languages || '',
            timezone: data.timezone || '',
            interests: data.interests || '',
            age: data.age || ''
          });
        } else if (res.status === 403 && data.message === 'Failed to authenticate token') {
          // If the token is expired or invalid, clear localStorage and prompt user to login again
          localStorage.removeItem('token');
          alert('Session expired. Please log in again.');
          navigate('/'); // Redirect to login page
        } else {
          alert('Failed to fetch profile data: ' + (data.message || 'Unknown error'));
        }
      };
    
      fetchProfile();
    }, [navigate]); // Add navigate as a dependency to useEffect

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile({
            ...profile,
            [name]: value
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage

        const res = await fetch('http://localhost:4000/api/profile/update', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Include the token in the Authorization header
            },
            body: JSON.stringify(profile),
        });

        if (res.ok) {
            alert('Profile updated successfully!');
        } else {
            alert('Failed to update profile');
        }
    };

    return (
        <div>
            <h2>Edit Profile</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name:</label>
                    <input type="text" name="name" value={profile.name} onChange={handleChange} />
                </div>
                <div>
                    <label>Proficient Languages:</label>
                    <input type="text" name="proficientLanguages" value={profile.proficientLanguages} onChange={handleChange} />
                </div>
                <div>
                    <label>Learning Languages:</label>
                    <input type="text" name="learningLanguages" value={profile.learningLanguages} onChange={handleChange} />
                </div>
                <div>
                    <label>Timezone:</label>
                    <input type="text" name="timezone" value={profile.timezone} onChange={handleChange} />
                </div>
                <div>
                    <label>Interests/Hobbies:</label>
                    <input type="text" name="interests" value={profile.interests} onChange={handleChange} />
                </div>
                <div>
                    <label>Age:</label>
                    <input type="number" name="age" value={profile.age} onChange={handleChange} />
                </div>
                <button type="submit">Update Profile</button>
            </form>
            <Link to="/home">
                <button>Home</button>
            </Link>
        </div>
    );
};

export default EditProfile;
