
import React, { useState,useContext } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import { DarkModeContext } from './DarkModeContext'; 

const Chatbot = () => {
  const [userMessage, setUserMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [loading, setLoading] = useState(false); // New loading state
  const { darkMode, setDarkMode } = useContext(DarkModeContext); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    // Set loading to true to show the loading indicator
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:4000/api/chat',
        {
          message: userMessage,
          language: selectedLanguage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update chat history with user's message and bot's response
      setChatHistory([
        ...chatHistory,
        { sender: 'user', text: userMessage },
        { sender: 'bot', text: response.data.response },
      ]);
      setUserMessage(''); // Clear the input field after sending
    } catch (error) {
      console.error('Error interacting with the chatbot:', error);
    } finally {
      // Set loading to false once the response is received
      setLoading(false);
    }
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className={`flex flex-col h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'} p-4`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${darkMode ? 'from-blue-400 to-purple-400' : 'from-blue-500 to-purple-500'}`}>
            LingoBuddy
          </h2>
  
          <div className="text-center">
            <label htmlFor="language-select" className={`text-sm font-medium mr-2 ${darkMode ? 'text-white' : 'text-black'}`}>
              Choose a language:
            </label>
            <select
              id="language-select"
              value={selectedLanguage}
              onChange={handleLanguageChange}
              className={`p-2 border rounded-md ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'}`}
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="Polish">Polish</option>
              <option value="German">German</option>
              <option value="Italian">Italian</option>
            </select>
          </div>
        </div>
  
        {/* Chat History */}
        <div className={`flex-grow rounded-md p-4 overflow-y-auto mb-4 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
          {chatHistory.map((chat, index) => (
            <div key={index} className={`mb-3 ${chat.sender === 'user' ? 'text-right' : 'text-left'}`}>
              <span
                className={`inline-block p-2 rounded-lg ${
                  chat.sender === 'user' ? (darkMode ? 'bg-blue-500 text-white' : 'bg-blue-500 text-white') : (darkMode ? 'bg-gray-600 text-white' : 'bg-gray-300 text-black')}`}
              >
                {chat.text}
              </span>
            </div>
          ))}
          {loading && (
            <div className="text-center mt-4">
              <span className={`inline-flex items-center px-4 py-2 text-sm font-medium leading-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Typing...
              </span>
            </div>
          )}
        </div>
  
        {/* Message Input */}
        <form onSubmit={handleSubmit} className="flex items-center">
          <input
            type="text"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            placeholder="Type your message here..."
            className={`flex-grow p-3 rounded-l-lg border ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'} outline-none`}
            disabled={loading} // Disable input when loading
          />
          <button
            type="submit"
            className={`px-6 py-3 rounded-r-lg font-medium ${loading ? 'bg-gray-500 cursor-not-allowed' : (darkMode ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white')}`}
            disabled={loading} // Disable button when loading
          >
            {loading ? 'Loading...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
