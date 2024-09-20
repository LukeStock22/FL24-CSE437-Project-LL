import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import GoogleLoginButton from './GoogleLoginButton'; // Assuming this is working later

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:4000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success) {
      alert('Login successful!');
      window.location.href = '/home'; // Redirect to home after login
    } else {
      alert('Login failed');
    }
  };
  

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>

      <GoogleLoginButton />

      <p>
        Don't have an account yet? <Link to="/signup">Sign up here!</Link>
      </p>
    </div>
  );
};

export default Login;
