import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Select from 'react-select';

// Language options for dropdowns
const languageOptions = [
  { value: 'English', label: 'English' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'French', label: 'French' },
  { value: 'German', label: 'German' },
  { value: 'Chinese', label: 'Chinese' },
  { value: 'Japanese', label: 'Japanese' },
  { value: 'Hindi', label: 'Hindi' },
  { value: 'Russian', label: 'Russian' },
  { value: 'Italian', label: 'Italian' },
  { value: 'Arabic', label: 'Arabic' },
  { value: 'Portuguese', label: 'Portuguese' },
  { value: 'Korean', label: 'Korean' },
  { value: 'Polish', label: 'Polish' },
  { value: 'Dutch', label: 'Dutch' },
  { value: 'Turkish', label: 'Turkish' },
  { value: 'Greek', label: 'Greek' },
  { value: 'Hebrew', label: 'Hebrew' },
];

const EditProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: '',
    proficientLanguages: [],
    learningLanguages: [],
    timezone: '',
    interests: '',
    age: ''
  });

  const [successMessage, setSuccessMessage] = useState(''); // State for success message

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProfile({
          name: data.name || '',
          proficientLanguages: data.proficient_languages ? data.proficient_languages.split(',').map(lang => ({ value: lang, label: lang })) : [],
          learningLanguages: data.learning_languages ? data.learning_languages.split(',').map(lang => ({ value: lang, label: lang })) : [],
          timezone: data.timezone || '',
          interests: data.interests || '',
          age: data.age || ''
        });
      } else if (res.status === 403 && data.message === 'Failed to authenticate token') {
        localStorage.removeItem('token');
        alert('Session expired. Please log in again.');
        navigate('/login');
      } else {
        alert('Failed to fetch profile data: ' + (data.message || 'Unknown error'));
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value
    });
  };

  const handleLanguageChange = (selectedOptions, actionMeta) => {
    setProfile({
      ...profile,
      [actionMeta.name]: selectedOptions || []
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const updatedProfile = {
      ...profile,
      proficientLanguages: profile.proficientLanguages.map(lang => lang.value).join(','),
      learningLanguages: profile.learningLanguages.map(lang => lang.value).join(',')
    };

    const res = await fetch('http://localhost:4000/api/profile/update', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updatedProfile),
    });

    if (res.ok) {
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
    } else {
      setSuccessMessage('Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h2 className="text-3xl font-bold mb-6">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">Name:</label>
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block mb-2">Proficient Languages:</label>
          <Select
            isMulti
            name="proficientLanguages"
            options={languageOptions}
            value={profile.proficientLanguages}
            onChange={handleLanguageChange}
            className="basic-multi-select"
            classNamePrefix="select"
          />
        </div>

        <div>
          <label className="block mb-2">Learning Languages:</label>
          <Select
            isMulti
            name="learningLanguages"
            options={languageOptions}
            value={profile.learningLanguages}
            onChange={handleLanguageChange}
            className="basic-multi-select"
            classNamePrefix="select"
          />
        </div>

        <div>
          <label className="block mb-2">Timezone:</label>
          <input
            type="text"
            name="timezone"
            value={profile.timezone}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block mb-2">Interests/Hobbies:</label>
          <input
            type="text"
            name="interests"
            value={profile.interests}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block mb-2">Age:</label>
          <input
            type="number"
            name="age"
            value={profile.age}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="flex items-center">
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Update Profile
          </button>
          {/* Show success message */}
          {successMessage && <span className="ml-4 text-green-500">{successMessage}</span>}
        </div>
      </form>

      <Link to="/home">
        <button className="mt-4 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600">
          Home
        </button>
      </Link>
    </div>
  );
};

export default EditProfile;
