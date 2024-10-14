import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';  // Import socket.io-client

const socket = io('http://localhost:4000'); // Connect to the backend

const Messages = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [friends, setFriends] = useState([]);
  const [darkMode, setDarkMode] = useState(true);

  const hasJoinedChat = useRef(false); // To prevent multiple join events

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    fetchFriends();
  }, [chats]);

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

  const sendMessage = () => {
    if (!selectedChat || !newMessage) return;

    const token = localStorage.getItem('token');
    const userId = JSON.parse(atob(token.split('.')[1])).id;
    const userName = JSON.parse(atob(token.split('.')[1])).name; // assuming you have the name in your JWT token

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
    <div className={`min-h-screen p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <h2 className="text-3xl font-bold mb-6">Messages</h2>

      <button
        onClick={() => setDarkMode(!darkMode)}
        className="mb-4 bg-gray-700 text-white py-2 px-4 rounded hover:bg-gray-600"
      >
        Toggle Dark Mode
      </button>

      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-4">Start a Chat</h3>
        {friends.map(friend => (
          <button
            key={friend.id}
            onClick={() => startChat(friend.id)}
            className={`py-1 px-4 rounded mr-2 mb-2 ${darkMode ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-green-200 text-black hover:bg-green-300'}`}
          >
            {friend.name}
          </button>
        ))}
      </div>

      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-4">Your Chats</h3>
        {chats.map((chat) => (
          <div key={chat.id} className="mb-2">
            <button
              onClick={() => { setSelectedChat(chat.id); }}
              className={`py-1 px-4 rounded ${darkMode ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-blue-200 text-black hover:bg-blue-300'}`}
            >
              Chat with {chat.friend_name}
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

      <Link to="/home">
        <button className={`mt-4 py-2 px-4 rounded ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-500 text-white hover:bg-gray-400'}`}>
          Home
        </button>
      </Link>
    </div>
  );
};

export default Messages;
