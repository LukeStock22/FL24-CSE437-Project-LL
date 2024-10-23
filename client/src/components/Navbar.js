import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DarkModeContext } from './DarkModeContext'; 

const Navbar = () => {
  const [username, setUsername] = useState('');
  const { darkMode, setDarkMode } = useContext(DarkModeContext); 
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:4000/api/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setUsername(data.name);
        } else {
          alert('Failed to fetch username');
          navigate('/login');
        }
      })
      .catch((error) => {
        console.error('Error fetching username:', error);
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div>
      <div className={`flex justify-between p-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} shadow-md`}>
        <h1 className="text-3xl font-bold">Welcome, {username}!</h1>
        <div className="space-x-4">
          <Link to="/home">
            <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Home</button>
          </Link>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`py-2 px-4 rounded ${
              darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-600'
            } text-white`}
          >
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>

          <button onClick={handleLogout} className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600">
            Logout
          </button>
          <Link to="/edit-profile">
            <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Edit Profile</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;