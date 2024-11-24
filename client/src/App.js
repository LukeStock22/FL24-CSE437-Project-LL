import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { DarkModeProvider } from './components/DarkModeContext';
import { SocketProvider } from './context/SocketContext';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import EditProfile from './components/EditProfile';
import Messages from './components/Messages';
import Matching from './components/Matching';
import ViewProfile from './components/ViewProfile';
import Landing from './components/Landing';
import About from './components/About';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Chatbot from './components/Chatbot';
import VideoCall from './components/VideoCall';
import StepOne from './components/StepOne';
import StepTwo from './components/StepTwo';

import './tailwind.css';


const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <SocketProvider isAuthenticated={isAuthenticated}> {/* Initialize Socket.IO globally */}
      <DarkModeProvider> {/* Provide dark mode context globally */}
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/home" element={<Home />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/matching" element={<Matching />} />
            <Route path="/view-profile/:id" element={<ViewProfile />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/password-reset/:token" element={<ResetPassword />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/video-call" element={<VideoCall />} />
            <Route path="/edit-profile/step-1" element={<StepOne />} />
            <Route path="/edit-profile/step-2" element={<StepTwo />} />
          </Routes>
        </Router>
      </DarkModeProvider>
    </SocketProvider>
  );
};

export default App;
