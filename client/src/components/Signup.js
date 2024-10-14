import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:4000/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('token', data.token);
      alert('Signup successful!');
      navigate('/edit-profile');
    } else {
      setErrorMessage('Signup failed. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-300 to-gray-400">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-700">Signup</h2>
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 transition duration-200"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 transition duration-200"
          />

          {/* Error Message */}
          {errorMessage && (
            <p className="text-red-500 bg-red-100 p-2 rounded text-center">{errorMessage}</p>
          )}

          <button
            type="submit"
            className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 font-semibold"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;

