import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home'; // Importing Home.js correctly
import EditProfile from './components/EditProfile';
import Messages from './components/Messages';
import Matching from './components/Matching';
//import './tailwind.css'; //wasn't working as intended

const App = () => {
  return (
    
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} /> {/* This points to Home.js */}
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/matching" element={<Matching />} />
      </Routes>
    </Router>
  );
};

export default App;

