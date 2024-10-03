import React from 'react';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 text-gray-800 text-center">
      <h1 className="text-4xl font-bold mb-4">About Us</h1>
      <p className="text-lg max-w-2xl px-4 mb-6">
        Welcome to our language learning platform! We connect language learners from around the world, allowing them to practice speaking, writing, and listening skills with native speakers and fellow learners. Our goal is to foster a dynamic and engaging learning experience through real-world practice and cultural exchange.
      </p>
      <button
        onClick={() => navigate(-1)} // Go back to the previous page
        className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
      >
        Back
      </button>
    </div>
  );
};

export default About;
