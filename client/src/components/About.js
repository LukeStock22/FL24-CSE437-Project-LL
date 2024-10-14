import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './logo.webp'; // Import the logo

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      {/* Main Container */}
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center">
        {/* Text Section */}
        <div className="space-y-6">
          <h1 className="text-5xl font-bold text-gray-900">
            Nice to meet you
          </h1>
          <p className="text-lg text-gray-700 leading-relaxed">
            Welcome to our language learning platform! We connect language learners from around the world, allowing them to practice speaking, writing, and listening skills with native speakers and fellow learners. Our goal is to foster a dynamic and engaging learning experience through real-world practice and cultural exchange.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 inline-block bg-blue-500 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-600 transition duration-300"
          >
            Back
          </button>
        </div>

        {/* Image Section */}
        <div className="flex justify-center">
          <img
            src={logo} // Use the imported image
            alt="Logo"
            className="rounded-lg shadow-lg object-cover h-96 w-full"
          />
        </div>
      </div>

      {/* Footer Section */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-200 py-4 px-6 flex justify-between items-center text-sm text-gray-700">
        <div className="flex space-x-4">
          <span>Learn</span>
          <span>Practice in Real-Time</span>
          <span>Language Exchange Groups</span>
        </div>
        <div>
          <span>© 2024 Fluency Awaits</span>
        </div>
      </div>
    </div>
  );
};

export default About;
