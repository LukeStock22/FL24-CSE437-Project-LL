import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Messages = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [friends, setFriends] = useState([]);

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
      .then((data) => setChats(data))
      .catch((err) => console.error('Error fetching chats:', err));
  };

  const fetchFriends = () => {
    // Fetch friends that user can start a chat with
    // Assume you have a route `/api/friends`
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
          fetchChats(); // Refresh chats
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
    <div>
      <h2>Messages</h2>

      {/* Start a new chat */}
      <div>
        <h3>Start a Chat</h3>
        {friends.map((friend) => (
          <button key={friend.id} onClick={() => startChat(friend.id)}>
            {friend.name}
          </button>
        ))}
      </div>

      {/* List of chats */}
      <div>
        <h3>Your Chats</h3>
        {chats.map((chat) => (
          <div key={chat.id}>
            <button onClick={() => { setSelectedChat(chat.id); fetchMessages(chat.id); }}>
              Chat with {chat.friend_name}
            </button>
          </div>
        ))}
      </div>

      {/* Chat messages */}
      {selectedChat && (
        <div>
          <h3>Chat</h3>
          <div>
            {messages.map((msg) => (
              <p key={msg.id}>
                <strong>{msg.sender_name}: </strong>{msg.message}
              </p>
            ))}
          </div>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}

      <Link to="/home">
        <button>Home</button>
      </Link>
    </div>
  );
};

export default Messages;
