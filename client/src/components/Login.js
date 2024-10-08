import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // State for error message
  const navigate = useNavigate(); // Use useNavigate to handle routing

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:4000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success) {
      // Store the JWT token in localStorage
      localStorage.setItem('token', data.token); // Save token for later use
      console.log('Token:', data.token);
      setErrorMessage(''); // Clear any previous error messages
      navigate('/home'); // Redirecting to /home after successful login
    } else {
      setErrorMessage('Password or username was incorrect'); // Set error message if login fails
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
          
          {/* Conditionally render the error message */}
          {errorMessage && (
            <p className="text-red-500 text-center">{errorMessage}</p>
          )}

          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-center">
          Don't have an account yet? <Link to="/signup" className="text-blue-500">Sign up here!</Link>
        </p>
        <p className="mt-4 text-center">
          <Link to="/forgot-password" className="text-blue-500">Forgot Password?</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
