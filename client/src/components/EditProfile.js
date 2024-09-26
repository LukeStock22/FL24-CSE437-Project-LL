import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const EditProfile = () => {
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
      const res = await fetch('http://localhost:4000/api/profile'); 
      const data = await res.json();
      if (data) {
        setProfile({
          name: data.name || '',
          proficientLanguages: data.proficient_languages || '',
          learningLanguages: data.learning_languages || '',
          timezone: data.timezone || '',
          interests: data.interests || '',
          age: data.age || ''
        });
      }
    };
    fetchProfile();
  }, []);

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
    const res = await fetch('http://localhost:4000/api/profile/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
        <button type="submit">Save Changes</button>
      </form>
      <Link to="/home">
        <button>Home</button>
      </Link>
    </div>
  );
};

export default EditProfile;

