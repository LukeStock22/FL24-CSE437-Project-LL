import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';

const languageOptions = [
    { value: 'English', label: 'English' },
    { value: 'Spanish', label: 'Spanish' },
    { value: 'French', label: 'French' },
    { value: 'Polish', label: 'Polish' },
    { value: 'Italian', label: 'Italian' },
    { value: 'Mandarin', label: 'Mandarin' },
    { value: 'German', label: 'German' },
    { value: 'Hindi', label: 'Hindi' },
    { value: 'Russian', label: 'Russian' },
    // Add more languages as needed
  ];

const StepTwo = () => {
  const navigate = useNavigate();
  const [stepTwoData, setStepTwoData] = useState({
    proficientLanguages: [],
    learningLanguages: [],
    interests: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStepTwoData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLanguageChange = (selectedOptions, name) => {
    setStepTwoData((prev) => ({
      ...prev,
      [name]: selectedOptions.map((option) => option.value),
    }));
  };

  const handleSubmit = async () => {
    const stepOneData = JSON.parse(localStorage.getItem('stepOneData'));
    const profileData = { ...stepOneData, ...stepTwoData };

    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:4000/api/profile/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    if (res.ok) {
      navigate('/home');
    } else {
      alert('Failed to update profile');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Step 2: Additional Information</h2>
        <form className="space-y-4">
          <div>
            <label className="block mb-2 text-sm text-gray-600">Proficient Languages</label>
            <Select
              isMulti
              options={languageOptions}
              placeholder="Select Proficient Languages"
              onChange={(selectedOptions) => handleLanguageChange(selectedOptions, 'proficientLanguages')}
              className="text-sm"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm text-gray-600">Learning Languages</label>
            <Select
              isMulti
              options={languageOptions}
              placeholder="Select Learning Languages"
              onChange={(selectedOptions) => handleLanguageChange(selectedOptions, 'learningLanguages')}
              className="text-sm"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm text-gray-600">Interests / Hobbies</label>
            <input
              type="text"
              name="interests"
              placeholder="Enter your interests"
              value={stepTwoData.interests}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => navigate('/edit-profile/step-1')}
              className="text-gray-600 text-sm flex items-center hover:underline"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600"
            >
              Finish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StepTwo;
