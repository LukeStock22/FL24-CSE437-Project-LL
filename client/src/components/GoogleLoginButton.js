import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const GoogleLoginButton = () => {
    const handleSuccess = async (response) => {
        try {
          const res = await fetch('http://localhost:3000/api/google-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: response.credential }),
          });
          const data = await res.json();
          if (data.success) {
            alert('Login successful!');
          } else {
            alert('Login failed');
          }
        } catch (error) {
          console.error('Google Login Error', error);
        }
      };
      

  const handleFailure = (error) => {
    console.error('Google Login Failed', error);
  };

  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleFailure}
      />
    </GoogleOAuthProvider>
  );
};

export default GoogleLoginButton;
