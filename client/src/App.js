import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home'; // Importing Home.js correctly
import EditProfile from './components/EditProfile';
import Messages from './components/Messages';
import Matching from './components/Matching';
import ViewProfile from './components/ViewProfile';
import Landing from './components/Landing';
import About from './components/About'
import './tailwind.css';

const App = () => {
  return (
    
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
      </Routes>
    </Router>
  );
};

export default App;

