import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { DarkModeProvider } from './components/DarkModeContext';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home'; // Importing Home.js correctly
import EditProfile from './components/EditProfile';
import Messages from './components/Messages';
import Matching from './components/Matching';
import ViewProfile from './components/ViewProfile';
import Landing from './components/Landing';
import About from './components/About';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import './tailwind.css';

const App = () => {
  return (
    <DarkModeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<Home />} /> {/* This points to Home.js */}
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/matching" element={<Matching />} />
          <Route path="/view-profile/:id" element={<ViewProfile />} />
          <Route path="/forgot-password" element={<ForgotPassword />} /> 
          <Route path="/password-reset/:token" element={<ResetPassword />} />
        </Routes>
      </Router>
    </DarkModeProvider>
  );
};

export default App;

