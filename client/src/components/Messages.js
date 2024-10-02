import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const Messages = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [friends, setFriends] = useState([]);
  const [activeChatUserIds, setActiveChatUserIds] = useState([]);
  const [messageOptions, setMessageOptions] = useState(null);
  const [messageReactions, setMessageReactions] = useState({});
  const [translationOptions, setTranslationOptions] = useState(null);
  const [translationLanguage, setTranslationLanguage] = useState('');
  const [darkMode, setDarkMode] = useState(true);

  const optionsRef = useRef(null);
  const languageOptions = ['Spanish', 'French', 'German', 'Polish', 'Chinese', 'Japanese', 'Hindi'];

  useEffect(() => {
    fetchChats(); // Fetch chats first to update active chat user IDs
  }, []);

  useEffect(() => {
    fetchFriends(); // Fetch friends whenever chats are updated
  }, [chats]); // Add `chats` as a dependency to refetch friends whenever the chats list changes

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setMessageOptions(null);
        setTranslationOptions(null);
      }
    };

    if (messageOptions || translationOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [messageOptions, translationOptions]);

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
      .then((data) => {
        // Filter out friends who are already in an active chat
        const filteredFriends = data.filter(friend => !activeChatUserIds.includes(friend.id));
        setFriends(filteredFriends);
      })
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
          fetchChats(); // Refresh chats to include the new chat
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

  const toggleMessageOptions = (messageId) => {
    if (messageOptions === messageId) {
      setMessageOptions(null);
    } else {
      setMessageOptions(messageId);
    }
  };

  const handleReaction = (messageId, reaction) => {
    setMessageReactions(prevReactions => ({
      ...prevReactions,
      [messageId]: reaction,
    }));
    setMessageOptions(null);
  };

  const handleTranslate = (messageId) => {
    setTranslationOptions(messageId);
  };

  const performTranslation = (messageId, language) => {
    const translatedMessage = `${messages.find(msg => msg.id === messageId).message} (translated to ${language})`;
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === messageId ? { ...msg, message: translatedMessage } : msg
      )
    );
    setTranslationOptions(null);
  };

  return (
    <div className={`min-h-screen p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <h2 className="text-3xl font-bold mb-6">Messages</h2>

      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="mb-4 bg-gray-700 text-white py-2 px-4 rounded hover:bg-gray-600"
      >
        Toggle Dark Mode
      </button>

      {/* Start a new chat */}
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

      {/* List of chats */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-4">Your Chats</h3>
        {chats.map((chat) => (
          <div key={chat.id} className="mb-2">
            <button
              onClick={() => { setSelectedChat(chat.id); fetchMessages(chat.id); }}
              className={`py-1 px-4 rounded ${darkMode ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-blue-200 text-black hover:bg-blue-300'}`}
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
          <div className={`p-4 rounded shadow mb-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} max-h-80 overflow-y-auto`}>
            {messages.map((msg) => (
              <div key={msg.id} className={`relative mb-4 p-2 rounded ${msg.sender_name === 'You' ? 'bg-blue-600 self-end' : 'bg-gray-700'} max-w-xs`}>
                <p onContextMenu={(e) => { e.preventDefault(); toggleMessageOptions(msg.id); }}>
                  <strong>{msg.sender_name}: </strong>{msg.message}
                </p>

                {/* Options Popup */}
                {messageOptions === msg.id && (
                  <div ref={optionsRef} className="absolute bg-gray-200 text-black p-2 rounded shadow-lg top-0 right-0 z-10">
                    <button onClick={() => handleReaction(msg.id, '❤️')} className="mr-2">❤️</button>
                    <button onClick={() => handleReaction(msg.id, '👍')} className="mr-2">👍</button>
                    <button onClick={() => handleReaction(msg.id, '👎')} className="mr-2">👎</button>
                    <button onClick={() => handleReaction(msg.id, '❓')} className="mr-2">❓</button>
                    <button onClick={() => handleReaction(msg.id, '❗')} className="mr-2">❗</button>
                    <button onClick={() => handleTranslate(msg.id)} className="mr-2">🌐 Translate</button>
                  </div>
                )}

                {/* Translation Popup */}
                {translationOptions === msg.id && (
                  <div ref={optionsRef} className="absolute bg-gray-200 text-black p-2 rounded shadow-lg top-0 right-0 z-10">
                    {languageOptions.map(lang => (
                      <button key={lang} onClick={() => performTranslation(msg.id, lang)} className="mr-2">{lang}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
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
