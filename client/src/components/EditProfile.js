import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import Navbar from './Navbar';
import { DarkModeContext } from './DarkModeContext'; 

const languageOptions = [
  { value: 'English', label: 'English' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'French', label: 'French' },
  // Add more languages as needed
];

const timezoneOptions = [
  { value: 'EST', label: 'EST (Eastern Standard Time)' },
  { value: 'CST', label: 'CST (Central Standard Time)' },
  { value: 'PST', label: 'PST (Pacific Standard Time)' }
];

const EditProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: '',
    proficientLanguages: [],
    learningLanguages: [],
    timezone: '',
    interests: '',
    age: '',
    phoneNumber: ''  // Add phoneNumber to profile state
  });

  const [successMessage, setSuccessMessage] = useState('');
  const { darkMode, setDarkMode } = useContext(DarkModeContext);

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
          age: data.age || '',
          phoneNumber: data.phone_number || ''  // Initialize with existing phone number
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

  const handleTimezoneChange = (selectedOption, { name }) => {
    setProfile({
      ...profile,
      [name]: selectedOption ? selectedOption.value : ''  // Access the value from the selected option
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
      navigate('/home');
    } else {
      setSuccessMessage('Failed to update profile');
    }
  };

  return (
    <div>
      <Navbar />
      <div className={`min-h-screen p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
        <h2 className="text-3xl font-bold mb-6">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">{darkMode ? <span className="text-gray-300">Name:</span> : 'Name:'}</label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'border-gray-300'}`}
            />
          </div>
  
          <div>
            <label className="block mb-2">{darkMode ? <span className="text-gray-300">Proficient Languages:</span> : 'Proficient Languages:'}</label>
            <Select
              isMulti
              name="proficientLanguages"
              options={languageOptions}
              value={profile.proficientLanguages}
              onChange={handleLanguageChange}
              className={`basic-multi-select ${darkMode ? 'bg-gray-800 text-white' : ''}`}
              classNamePrefix="select"
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                  color: darkMode ? '#FFFFFF' : '#000000',
                  borderColor: darkMode ? '#4A5568' : '#E2E8F0',
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                  color: darkMode ? '#FFFFFF' : '#000000',
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused
                    ? darkMode ? '#1A202C' : '#E2E8F0'
                    : darkMode ? '#2D3748' : '#FFFFFF',
                  color: darkMode ? (state.isFocused ? '#CBD5E0' : '#FFFFFF') : (state.isFocused ? '#4A5568' : '#000000'),
                  cursor: 'pointer',
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: darkMode ? '#4A5568' : '#CBD5E0',
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: darkMode ? '#FFFFFF' : '#000000',
                }),
                placeholder: (base) => ({
                  ...base,
                  color: darkMode ? '#A0AEC0' : '#718096',
                }),
                singleValue: (base) => ({
                  ...base,
                  color: darkMode ? '#FFFFFF' : '#000000',
                }),
              }}
            />
          </div>
  
          <div>
            <label className="block mb-2">{darkMode ? <span className="text-gray-300">Learning Languages:</span> : 'Learning Languages:'}</label>
            <Select
              isMulti
              name="learningLanguages"
              options={languageOptions}
              value={profile.learningLanguages}
              onChange={handleLanguageChange}
              className={`basic-multi-select ${darkMode ? 'bg-gray-800 text-white' : ''}`}
              classNamePrefix="select"
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                  color: darkMode ? '#FFFFFF' : '#000000',
                  borderColor: darkMode ? '#4A5568' : '#E2E8F0',
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                  color: darkMode ? '#FFFFFF' : '#000000',
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused
                    ? darkMode ? '#1A202C' : '#E2E8F0'
                    : darkMode ? '#2D3748' : '#FFFFFF',
                  color: darkMode ? (state.isFocused ? '#CBD5E0' : '#FFFFFF') : (state.isFocused ? '#4A5568' : '#000000'),
                  cursor: 'pointer',
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: darkMode ? '#4A5568' : '#CBD5E0',
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: darkMode ? '#FFFFFF' : '#000000',
                }),
                placeholder: (base) => ({
                  ...base,
                  color: darkMode ? '#A0AEC0' : '#718096',
                }),
                singleValue: (base) => ({
                  ...base,
                  color: darkMode ? '#FFFFFF' : '#000000',
                }),
              }}
            />
          </div>
  
          <div>
            <label className="block mb-2">{darkMode ? <span className="text-gray-300">Timezone:</span> : 'Timezone:'}</label>
            <Select
              options={timezoneOptions} 
              value={timezoneOptions.find(option => option.value === profile.timezone)}
              name="timezone"
              onChange={handleTimezoneChange}
              className={`basic-select ${darkMode ? 'bg-gray-800 text-white' : ''}`}
              classNamePrefix="select"
              placeholder=""
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                  color: darkMode ? '#FFFFFF' : '#000000',
                  borderColor: darkMode ? '#4A5568' : '#E2E8F0',
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                  color: darkMode ? '#FFFFFF' : '#000000',
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused
                    ? darkMode ? '#1A202C' : '#E2E8F0'
                    : darkMode ? '#2D3748' : '#FFFFFF',
                  color: darkMode ? (state.isFocused ? '#CBD5E0' : '#FFFFFF') : (state.isFocused ? '#4A5568' : '#000000'),
                  cursor: 'pointer',
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: darkMode ? '#4A5568' : '#CBD5E0',
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: darkMode ? '#FFFFFF' : '#000000',
                }),
                placeholder: (base) => ({
                  ...base,
                  color: darkMode ? '#A0AEC0' : '#718096',
                }),
                singleValue: (base) => ({
                  ...base,
                  color: darkMode ? '#FFFFFF' : '#000000',
                }),
              }}
            />
          </div>
          <div>
            <label className="block mb-2">{darkMode ? <span className="text-gray-300">Interests/Hobbies:</span> : 'Interests/Hobbies:'}</label>
            <input
              type="text"
              name="interests"
              value={profile.interests}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'border-gray-300'}`}
            />
          </div>
          <div>
            <label className="block mb-2">{darkMode ? <span className="text-gray-300">Age:</span> : 'Age:'}</label>
            <input
              type="number"
              name="age"
              value={profile.age}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'border-gray-300'}`}
            />
          </div>
          {/* Phone Number Field */}
          <div>
          <label className="block mb-2">{darkMode ? <span className="text-gray-300">Phone Number:</span> : 'Age:'}</label>
            <input
              type="tel"
              name="phoneNumber"
              value={profile.phoneNumber}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'border-gray-300'}`}
              placeholder="Enter your phone number"
            />
          </div>
          <div className="flex items-center">
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Update Profile
            </button>
            {successMessage && <span className="ml-4 text-green-500">{successMessage}</span>}
          </div>
        </form>
      </div>
    </div>
  );
  
};

export default EditProfile;
