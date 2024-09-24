import React from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate is the new hook

const Home = () => {
  const navigate = useNavigate(); // Replacing useHistory with useNavigate

  const handleLogout = () => {
    // Clear session or token if needed (e.g., localStorage.removeItem('token'))
    navigate('/'); // Redirecting to login page
  };

  return (
    <div>
      <h2>Welcome to the Home Page</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Home;

