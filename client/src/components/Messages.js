import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';  // Import socket.io-client
import Navbar from './Navbar';
import { DarkModeContext } from './DarkModeContext'; 

const socket = io('http://localhost:4000'); // Connect to the backend

const Messages = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [friends, setFriends] = useState([]);
  const { darkMode, setDarkMode } = useContext(DarkModeContext); 

  const hasJoinedChat = useRef(false); // To prevent multiple join events

  useEffect(() => {
    fetchChats();
    fetchFriends(); // Fetch friends once when the component is loaded
  }, []);

  useEffect(() => {
    if (selectedChat && !hasJoinedChat.current) {
      // Join the chat room only once
      const token = localStorage.getItem('token');
      const userId = JSON.parse(atob(token.split('.')[1])).id;
      socket.emit('join_chat', { chat_id: selectedChat, user_id: userId });

      hasJoinedChat.current = true; // Mark that the user has joined the chat
    }
  }, [selectedChat]);

  useEffect(() => {
    const handleReceiveMessage = (messageData) => {
      setMessages(prevMessages => [...prevMessages, messageData]);
    };

    socket.on('receive_message', handleReceiveMessage);

    // Cleanup the event listener on component unmount or when selectedChat changes
    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [selectedChat]);

  useEffect(() => {
    if (selectedChat) {
        const token = localStorage.getItem('token');
        fetch(`http://localhost:4000/api/messages/${selectedChat}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })
        .then((res) => res.json())
        .then((data) => {
            setMessages(data); // Load the messages from the server
        })
        .catch((err) => console.error('Error fetching messages:', err));
    }
  }, [selectedChat]);

  const fetchChats = () => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:4000/api/chats', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setChats(data);
      })
      .catch((err) => console.error('Error fetching chats:', err));
  };

  const fetchFriends = () => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:4000/api/friends', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setFriends(data))
      .catch((err) => console.error('Error fetching friends:', err));
  };

  const startChat = (friend_id) => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:4000/api/chats/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ friend_id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          fetchChats(); // Refresh chats after starting a new chat
        }
      })
      .catch((err) => console.error('Error starting chat:', err));
  };

  const handleChatClick = (friend) => {
    const chat = chats.find(chat => chat.friend_id === friend.id);

    if (chat) {
      // If a chat already exists, set the selected chat
      setSelectedChat(chat.id);
    } else {
      // If no chat exists, start a new chat with this friend
      startChat(friend.id);
    }
  };

  const sendMessage = () => {
    if (!selectedChat || !newMessage) return;

    const token = localStorage.getItem('token');
    const userId = JSON.parse(atob(token.split('.')[1])).id;
    const userName = JSON.parse(atob(token.split('.')[1])).name;

    const messageData = {
        chat_id: selectedChat,
        sender_name: userName, // Use the real sender's name
        message: newMessage,
        sender_id: userId,
    };

    // Emit the message to the server
    socket.emit('send_message', messageData);

    // Clear the input field
    setNewMessage('');
  };

  const renderMessage = (msg, index) => {
    const token = localStorage.getItem('token');
    const userId = JSON.parse(atob(token.split('.')[1])).id;

    const isCurrentUser = msg.sender_id === userId;
    const senderName = isCurrentUser ? 'You' : msg.sender_name;

    return (
      <div key={`${msg.sender_id}-${index}`} className={`relative mb-4 p-2 rounded ${isCurrentUser ? 'bg-blue-600 self-end' : 'bg-gray-700'} max-w-xs`}>
        <strong>{senderName}: </strong>{msg.message}
      </div>
    );
  };

  return (
    <div>
      <Navbar/>
      <div className={`min-h-screen p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
        <h2 className="text-3xl font-bold mb-6">Messages</h2>

        {/* Remove Start a Chat section */}
        
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-4">Your Chats</h3>
          {friends.map(friend => (
            <div key={friend.id} className="mb-2">
              <button
                onClick={() => handleChatClick(friend)} // Handles both new and existing chats
                className={`py-1 px-4 rounded ${darkMode ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-blue-200 text-black hover:bg-blue-300'}`}
              >
                Chat with {friend.name}
              </button>
            </div>
          ))}
        </div>

        {selectedChat && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4">Chat</h3>
            <div className={`p-4 rounded shadow mb-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} max-h-80 overflow-y-auto`}>
              {messages.map((msg, index) => renderMessage(msg, index))}
            </div>

            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className={`w-full p-2 rounded mb-2 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-300 text-black'}`}
            />
            <button
              onClick={sendMessage}
              className={`py-2 px-4 rounded ${darkMode ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-blue-200 text-black hover:bg-blue-300'}`}
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
