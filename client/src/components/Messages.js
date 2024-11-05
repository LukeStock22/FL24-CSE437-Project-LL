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
  
  const hasJoinedChat = useRef(false);

  // Fetch initial data for chats and friends
  useEffect(() => {
    fetchChats();
    fetchFriends();
  }, []);

  useEffect(() => {
    console.log('Socket connection:', socket); // Confirm if socket is connected on load
  }, [socket]);

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
  
    if (!selectedChat || !newMessage || !isSocketConnected) {
      console.error('Cannot send message - Missing data or socket connection');
      return;
    }
  
    const token = localStorage.getItem('token');
    const userId = JSON.parse(atob(token.split('.')[1])).id;
    const userName = JSON.parse(atob(token.split('.')[1])).name;
  
    const messageData = {
      chat_id: selectedChat,
      sender_name: userName,
      message: newMessage,
      sender_id: userId,
    };
  
    console.log('Sending message:', messageData);
  
    socket.emit('send_message', messageData); // Emit message to the server only
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
      <div key={`${msg.sender_id}-${index}`} className={`relative mb-4 pt-2 pb-2 px-4 py-4 rounded
      ${isCurrentUser ? 'bg-blue-500 self-end text-white' : (darkMode? 'bg-gray-700' : 'bg-gray-300')} max-w-xs ${isCurrentUser ? 'ml-auto' : 'mr-auto'}`}>
        <strong>{senderName}: </strong>{msg.message}
      </div>
    );
  };

  return (
    <div className = "h-screen overflow-hidden">
      <Navbar />
      <div className={`h-full p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
        <h2 className="text-3xl font-bold mb-6">Messages</h2>
        <div className="h-full flex"> 
          <div className={`pr-4 ${showChat ? 'w-1/4' : 'w-full' }`}>
            <div className="flex flex-col">
              {friends.map((friend, index) => (
                <div key={friend.id}>
                  <button
                    onClick={() => handleChatClick(friend)} // Handles both new and existing chats
                    className={`w-full py-2 px-4 text-left rounded shadow ${darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-black hover:bg-gray-200 border-gray-300'}`}
                  >
                    {friend.name}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {showChat && (
            <div className="w-3/4 pl-1 relative flex flex-col"> 
              <div className="flex flex-row items-center w-full">
                {/* Video Call Button */}
                <button
                  onClick={handleVideoCall}
                  className="flex-grow bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 mb-4"
                >
                  Video Call
                </button>
                <button
                  onClick={() => setShowChat(false)}
                  className={`py-2 px-4 rounded flex mb-4 items-center justify-center text-2xl font-bold z-10 ${darkMode ? 'text-white hover:text-gray-200' : 'text-gray-500 hover:text-gray-600'}`}
                >
                  &times;
                </button>
              </div>
 
              <div className = "flex-col flex-grow flex">
                <div
                  ref={scrollContainerRef}
                  className={`flex-grow flex flex-col max-h-[60vh] p-4 rounded shadow mb-3 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} overflow-y-auto`}
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
                    className={`flex-grow p-3 shadow rounded-l ${darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-black'}`}
                  />
                  <button
                    onClick={sendMessage}
                    className={`px-6 py-3 rounded-r ${darkMode ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-blue-500 text-white hover:bg-blue-300'}`}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
};

export default Messages;
