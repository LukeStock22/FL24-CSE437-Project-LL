import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const words = [
  'Hello', 'Hola', 'Bonjour', 'Ciao', 'Hallo', 'こんにちは', '안녕하세요', '你好', 'Привет', 'مرحبا'
];

const LandingPage = () => {
  const [animatedWords, setAnimatedWords] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomWord = words[Math.floor(Math.random() * words.length)];
      setAnimatedWords((prevWords) => [...prevWords, randomWord]);
    }, 2000); // Add a new word every 2 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  return (
    <div className="relative flex flex-col justify-center items-center min-h-screen bg-gradient-to-r from-blue-400 to-purple-500 text-white text-center overflow-hidden">
      <h1 className="text-5xl font-bold mb-4 z-20 relative text-shadow-lg">
        Fluency Awaits – Join the Conversation!
      </h1>
      <p className="text-xl mb-8 z-20 relative text-shadow-md">
        Practice speaking, writing, and listening skills with native speakers and fellow learners.
      </p>
      <div className="flex space-x-4 z-20 relative">
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
      <Link to="/about" className="mt-8 text-white underline z-20 relative">
        Learn more &rarr;
      </Link>

      {/* Animated Words */}
      {animatedWords.map((word, index) => (
        <span
          key={index}
          className="absolute text-3xl font-semibold animate-floating text-white opacity-50 blur-sm"
          style={{
            top: `${Math.random() * 100}vh`, // Random position
            left: `${Math.random() * 100}vw`, // Random position
            animationDuration: `${Math.random() * 5 + 5}s`, // Random animation speed
          }}
        >
          {word}
        </span>
      ))}
    </div>
  );
};

export default LandingPage;
