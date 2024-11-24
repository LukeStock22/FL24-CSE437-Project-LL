import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';

const timezoneOptions = [
    { value: 'EST', label: 'EST (Eastern Standard Time)' },
    { value: 'CST', label: 'CST (Central Standard Time)' },
    { value: 'PST', label: 'PST (Pacific Standard Time)' },
    { value: 'GMT', label: 'GMT (Greenwich Mean Time)' },
    { value: 'UTC', label: 'UTC (Universal Time Coordinated)' },
    { value: 'AST', label: 'AST (Arabia Standard Time)' },
    { value: 'JST', label: 'Japan Standard Time' },
  
  ];

const StepOne = () => {
  const navigate = useNavigate();
  const [stepOneData, setStepOneData] = useState({
    name: '',
    phoneNumber: '',
    age: '',
    timezone: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStepOneData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTimezoneChange = (selectedOption) => {
    setStepOneData((prev) => ({ ...prev, timezone: selectedOption.value }));
  };

  const handleNext = () => {
    localStorage.setItem('stepOneData', JSON.stringify(stepOneData)); // Save step 1 data temporarily
    navigate('/edit-profile/step-2');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Step 1: Basic Information</h2>
        <form className="space-y-4">
          <div>
            <label className="block mb-2 text-sm text-gray-600">Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={stepOneData.name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm text-gray-600">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Enter your phone number"
              value={stepOneData.phoneNumber}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm text-gray-600">Age</label>
            <input
              type="number"
              name="age"
              placeholder="Enter your age"
              value={stepOneData.age}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm text-gray-600">Timezone</label>
            <Select
              options={timezoneOptions}
              placeholder="Select your timezone"
              onChange={handleTimezoneChange}
              className="text-sm"
            />
          </div>
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="text-gray-600 text-sm flex items-center hover:underline"
            >
              ← Back to Signup
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600"
            >
              Next →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StepOne;
