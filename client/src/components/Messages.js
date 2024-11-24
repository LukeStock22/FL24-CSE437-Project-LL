import React, { useState, useEffect, useRef, useContext } from 'react';
import Navbar from './Navbar';
import { DarkModeContext } from './DarkModeContext';
import { SocketContext } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';

const Messages = () => {
  const { socket, isSocketConnected } = useContext(SocketContext);
  const { darkMode } = useContext(DarkModeContext);
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedFriendName, setSelectedFriendName] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [friends, setFriends] = useState([]);
  const scrollContainerRef = useRef(null);
  const [selectedLanguage, setSelectedLanguage] = useState('English'); // Default translation mode
  const [translationPopup, setTranslationPopup] = useState(null); // Stores translation details
  
  const hasJoinedChat = useRef(false);
  //const isUserActive = (userId) => activeUsers.includes(userId);
  const [activeUsers, setActiveUsers] = useState([]); // New state to track active users

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const languages = [
    { value: 'EN', label: 'English' },
    { value: 'ES', label: 'Spanish' },
    { value: 'FR', label: 'French' },
    { value: 'PL', label: 'Polish' },
    { value: 'IT', label: 'Italian' },
    { value: 'ZH', label: 'Mandarin' }, // Simplified Chinese (Mandarin)
    { value: 'DE', label: 'German' },
    { value: 'HI', label: 'Hindi' },
    { value: 'RU', label: 'Russian' },
  ];

  // Fetch initial data for chats and friends
  useEffect(() => {
    fetchChats();
    fetchFriends();
  }, []);

  useEffect(() => {
    console.log('Socket connection:', socket); // Confirm if socket is connected on load
  }, [socket]);

  // Emit user ID to backend when connected
  useEffect(() => {
    if (isSocketConnected) {
      const token = localStorage.getItem('token');
      const userId = JSON.parse(atob(token.split('.')[1])).id;

      // Emit the user ID to the backend
      socket.emit('set_active_user', userId);
    }
  }, [socket, isSocketConnected]);

  // Listen for active users from backend
  useEffect(() => {
    if (isSocketConnected) {
      socket.on('active_users', (users) => {
        console.log('Active users received:', users); // Debugging log
        setActiveUsers(users);
      });

      // Cleanup listener on unmount
      return () => {
        socket.off('active_users');
      };
    }
  }, [socket, isSocketConnected]);

  const isUserActive = (userId) => {
    return activeUsers.includes(userId);
  };


  // Join the selected chat room when selectedChat changes
  useEffect(() => {
    if (selectedChat && isSocketConnected) {
      const token = localStorage.getItem('token');
      const userId = JSON.parse(atob(token.split('.')[1])).id;

      socket.emit('join_chat', { chat_id: selectedChat, user_id: userId });
      console.log(`Joined chat room: ${selectedChat}`);
      hasJoinedChat.current = selectedChat;

      return () => {
        hasJoinedChat.current = null;
      };
    }
  }, [selectedChat, isSocketConnected, socket]);

  // Real-time message updates for the selected chat
  useEffect(() => {
    if (isSocketConnected) {
      const handleReceiveMessage = (messageData) => {
        setMessages((prevMessages) => [...prevMessages, messageData]);
        console.log('Received message:', messageData);
      };

      socket.on('receive_message', handleReceiveMessage);

      return () => {
        socket.off('receive_message', handleReceiveMessage);
      };
    }
  }, [isSocketConnected, socket]);

  useEffect(() => {
    if (selectedChat) {
      const token = localStorage.getItem('token');
      fetch(`http://localhost:4000/api/messages/${selectedChat}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setMessages(data))
        .catch((err) => console.error('Error fetching messages:', err));
    }
  }, [selectedChat]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages]);

  const fetchChats = () => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:4000/api/chats', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setChats(data))
      .catch((err) => console.error('Error fetching chats:', err));
  };

  const fetchFriends = () => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:4000/api/friends', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setFriends(data))
      .catch((err) => console.error('Error fetching friends:', err));
  };

  const startChat = (friendId) => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:4000/api/chats/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ friend_id: friendId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          fetchChats();
        }
      })
      .catch((err) => console.error('Error starting chat:', err));
  };

  const handleChatClick = (friend) => {
    const chat = chats.find((chat) => chat.friend_id === friend.id);
    setSelectedFriendName(friend.name);
    setShowChat(true);

    if (chat) {
      setSelectedChat(chat.id);
    } else {
      startChat(friend.id);
    }
  };

  const sendMessage = () => {
    console.log('sendMessage function called');
  
    // Debugging log to check conditions
    console.log('selectedChat:', selectedChat);
    console.log('newMessage:', newMessage);
    console.log('isSocketConnected:', isSocketConnected);
  
    if (!selectedChat) {
      console.error('Cannot send message - No chat selected');
      return;
    }
  
    if (!newMessage.trim()) {
      console.error('Cannot send message - Message is empty');
      return;
    }
  
    if (!isSocketConnected) {
      console.error('Cannot send message - Socket is not connected');
      return;
    }
  
    const token = localStorage.getItem('token');
    const userId = JSON.parse(atob(token.split('.')[1])).id;
    const userName = JSON.parse(atob(token.split('.')[1])).name;
  
    const messageData = {
      chat_id: selectedChat,
      sender_name: userName,
      message: newMessage.trim(),
      sender_id: userId,
    };
  
    console.log('Sending message:', messageData);
  
    // Emit message to the server
    socket.emit('send_message', messageData);
    setNewMessage(''); // Clear input after sending
  };
  
  const handleVideoCall = () => {
    if (!selectedChat) {
      console.error("No chat selected");
      return;
    }
  
    const roomName = `VideoCall-${selectedChat}`; // Unique room name based on chat ID
  
    // Find the chat associated with the selected chat ID
    const chat = chats.find((chat) => chat.id === selectedChat);
    if (chat) {
      const friendId = chat.friend_id; // Get the friend's ID from the chat
      socket.emit('start-video-call', { roomName, friendId });
      navigate('/video-call', { state: { roomName } }); // Navigate to the VideoCall page with the room name
    } else {
      console.error("Chat not found for the selected chat ID");
    }
  };
  

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  const renderMessage = (msg, index) => {
    const token = localStorage.getItem('token');
    const userId = JSON.parse(atob(token.split('.')[1])).id;
    const isCurrentUser = msg.sender_id === userId;
    const senderName = isCurrentUser ? 'You' : msg.sender_name;
  
    return (
      <div
      key={`${msg.sender_id}-${index}`}
      onClick={() => {
        console.log('Message clicked:', msg.message); // Add this
        translateMessage(msg.message); // Trigger translation
      }}
      className={`relative mb-4 pt-2 pb-2 px-4 py-4 rounded cursor-pointer ${
        isCurrentUser ? 'bg-blue-500 self-end text-white' : (darkMode ? 'bg-gray-700' : 'bg-gray-300')
      } max-w-xs ${isCurrentUser ? 'ml-auto' : 'mr-auto'}`}
    >
      <strong>{senderName}: </strong>{msg.message}
    </div>
    );
  };

  // Function to handle message translation
  const translateMessage = async (message) => {
    try {
      const res = await fetch('http://localhost:4000/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: message,
          targetLanguage: selectedLanguage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTranslationPopup({ original: message, translated: data.translatedText });
      } else {
        console.error('Translation failed:', data.message);
      }
    } catch (error) {
      console.error('Error translating message:', error);
    }
  };

  // Function to close the translation popup
  const closeTranslationPopup = () => {
    setTranslationPopup(null);
  };

  return (
    <div className="h-screen overflow-hidden">
      <Navbar />
      <div className={`h-full p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Messages</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span> Active
          </span>
          <span className="text-sm">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span> Inactive
          </span>
        </div>
      </div>

        <div className="h-full flex">
          <div className={`pr-4 ${showChat ? 'w-1/4' : 'w-full'}`}>
            <div className="flex flex-col">
              {friends.map((friend, index) => (
                <div key={friend.id} className="flex items-center">
                  {/* Status Dot */}
                  <span
                    className={`inline-block w-3 h-3 rounded-full mr-2 ${
                      isUserActive(friend.id) ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    title={isUserActive(friend.id) ? 'Active' : 'Inactive'}
                  ></span>
                  {/* Friend Name Button */}
                  <button
                    onClick={() => handleChatClick(friend)} // Handles both new and existing chats
                    className={`w-full py-2 px-4 text-left rounded shadow ${
                      darkMode
                        ? 'bg-gray-800 text-white hover:bg-gray-700'
                        : 'bg-white text-black hover:bg-gray-200 border-gray-300'
                    }`}
                  >
                    {friend.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
  
          {showChat && (
            <div className="w-3/4 pl-1 relative flex flex-col">
              <div className="flex flex-row items-center w-full gap-4">
                {/* Dropdown */}
                <select
                  value={selectedLanguage}
                  onChange={handleLanguageChange}
                  className="flex-grow bg-gray-100 text-black py-2 px-4 rounded hover:bg-gray-200 mb-4 border border-gray-300"
                >
                  <option disabled>Translation Mode</option>
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
                {/* Video Call Button */}
                <button
                  onClick={handleVideoCall}
                  className="flex-grow bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 mb-4"
                >
                  Video Call
                </button>
                <button
                  onClick={() => setShowChat(false)}
                  className={`py-2 px-4 rounded flex mb-4 items-center justify-center text-2xl font-bold z-10 ${
                    darkMode ? 'text-white hover:text-gray-200' : 'text-gray-500 hover:text-gray-600'
                  }`}
                >
                  &times;
                </button>
              </div>
  
              <div className="flex-col flex-grow flex">
                <div
                  ref={scrollContainerRef}
                  className={`flex-grow flex flex-col max-h-[60vh] p-4 rounded shadow mb-3 ${
                    darkMode ? 'bg-gray-800 text-white' : 'bg-white'
                  } overflow-y-auto`}
                >
                  {messages.map((msg, index) => renderMessage(msg, index))}
                </div>
  
                <div className="flex items-center">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message here..."
                    className={`flex-grow p-3 shadow rounded-l ${
                      darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-black'
                    }`}
                  />
                  <button
                    onClick={sendMessage}
                    className={`px-6 py-3 rounded-r ${
                      darkMode ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-blue-500 text-white hover:bg-blue-300'
                    }`}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Translation Popup */}
      {translationPopup && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50"
          onClick={closeTranslationPopup}
        >
          <div
            className="bg-white p-6 rounded shadow-lg text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">Translation</h3>
            <p className="mb-4">
              <strong>Original:</strong> {translationPopup.original}
            </p>
            <p>
              <strong>Translated:</strong> {translationPopup.translated}
            </p>
            <button
              onClick={closeTranslationPopup}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
  
  
};

export default Messages;
