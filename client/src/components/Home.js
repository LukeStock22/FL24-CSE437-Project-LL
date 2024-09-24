import React from 'react';
import { useHistory, Link } from 'react-router-dom';

const Home = () => {
  const history = useHistory();

  const handleLogout = () => {
    // Clear any session data if you are using it
    // For example, clearing a token from localStorage:
    // localStorage.removeItem('token');

    // Redirect the user to the login page
    history.push('/login');
  };

  return (
    <div>
      <h2>Welcome to the Home Page</h2>
      <button onClick={handleLogout}>Logout</button>
      <Link to="/edit-profile">
        <button>Edit Profile</button>
      </Link>
    </div>
  );
};

export default Home;
