import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Messages = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [friends, setFriends] = useState([]);
  const [activeChatUserIds, setActiveChatUserIds] = useState([]);

  useEffect(() => {
    fetchChats();
    fetchFriends();
  }, []);

  const fetchChats = () => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:4000/api/chats', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setChats(data);
        const userId = JSON.parse(atob(token.split('.')[1])).id;
        const userIds = data.map(chat => (chat.user1_id === userId ? chat.user2_id : chat.user1_id));
        setActiveChatUserIds(userIds);
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

  const fetchMessages = (chat_id) => {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:4000/api/messages/${chat_id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch((err) => console.error('Error fetching messages:', err));
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
          fetchChats();
        }
      })
      .catch((err) => console.error('Error starting chat:', err));
  };

  const sendMessage = () => {
    if (!selectedChat || !newMessage) return;

    const token = localStorage.getItem('token');
    fetch('http://localhost:4000/api/messages/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ chat_id: selectedChat, message: newMessage }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setNewMessage('');
          fetchMessages(selectedChat);
        }
      })
      .catch((err) => console.error('Error sending message:', err));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h2 className="text-3xl font-bold mb-6">Messages</h2>

      {/* Start a new chat */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-4">Start a Chat</h3>
        {friends
          .filter(friend => !activeChatUserIds.includes(friend.id))
          .map(friend => (
            <button
              key={friend.id}
              onClick={() => startChat(friend.id)}
              className="bg-green-500 text-white py-1 px-4 rounded mr-2 hover:bg-green-600 mb-2"
            >
              {friend.name}
            </button>
          ))}
      </div>

      {/* List of chats */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-4">Your Chats</h3>
        {chats.map((chat) => (
          <div key={chat.id} className="mb-2">
            <button
              onClick={() => { setSelectedChat(chat.id); fetchMessages(chat.id); }}
              className="bg-blue-500 text-white py-1 px-4 rounded hover:bg-blue-600"
            >
              Chat with {chat.friend_name}
            </button>
          </div>
        ))}
      </div>

      {/* Chat messages */}
      {selectedChat && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-4">Chat</h3>
          <div className="bg-white p-4 rounded shadow mb-4">
            {messages.map((msg) => (
              <p key={msg.id} className="mb-2">
                <strong>{msg.sender_name}: </strong>{msg.message}
              </p>
            ))}
          </div>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-2"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      )}

      <Link to="/home">
        <button className="mt-4 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600">
          Home
        </button>
      </Link>
    </div>
  );
};

export default Messages;

