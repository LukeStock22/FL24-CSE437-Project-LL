import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-r from-blue-400 to-purple-500 text-white text-center">
      <h1 className="text-5xl font-bold mb-4">
        Fluency Awaits – Join the Conversation!
      </h1>
      <p className="text-xl mb-8">
        Practice speaking, writing, and listening skills with native speakers and fellow learners.
      </p>
      <div className="flex space-x-4">
        <Link to="/login">
          <button className="bg-white text-blue-500 font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-200 transition duration-300">
            Login
          </button>
        </Link>
        <Link to="/signup">
          <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-500 transition duration-300">
            Sign Up
          </button>
        </Link>
      </div>
      <Link to="/about" className="mt-8 text-white underline">
        Learn more &rarr;
      </Link>
    </div>
  );
};

export default LandingPage;
