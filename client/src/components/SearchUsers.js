import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { DarkModeContext } from './DarkModeContext'; 

const SearchUsers = ({users}) => { 
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(users); 
  const [blockedByUsers, setBlockedByUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const { darkMode, setDarkMode } = useContext(DarkModeContext); 

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term) {
        const filtered = users.filter((user) => {
            const isBlockedBy = blockedByUsers.includes(user.id); 
            const isCurrentUser = user.id === currentUser.id;
            return user.name.toLowerCase().includes(term) && !isBlockedBy && !isCurrentUser;
          });
        setFilteredUsers(filtered);
      } else {
        setFilteredUsers([]); 
      }
  };

  const navigate = useNavigate();

  // getting list of users who have blocked the current user
  useEffect(() => {
    const fetchBlockedBy = () => {
      const token = localStorage.getItem('token');
      fetch('http://localhost:4000/api/blockedBy', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (response.status === 401) {
            alert('Unauthorized. Please log in.');
            return;
          }
          return response.json();
        })
        .then((data) => {
          if (data.success) {
            setBlockedByUsers(data.blockedBy); //list of blocked by user IDs
          } else {
            console.error('Error fetching blocked users:', data.message);
          }
        })
        .catch((error) => {
          console.error('Error fetching blocked by users:', error);
        });
    };

    fetchBlockedBy();
  }, []);

   // get current user
    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch('http://localhost:4000/api/profile', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
            setCurrentUser(data);
            } else {
            alert('Failed to fetch current user');
            }
        })
        .catch((error) => {
            console.error('Error fetching user:', error);
        });
    }, []);

    return (
      <div className="relative mb-2"> 
        <input
          type="text"
          placeholder="Search users"
          value={searchTerm}
          onChange={handleSearch}
          className={`border rounded p-2 w-full ${darkMode ? 'bg-gray-700 border-gray-700 text-white' : 'border-gray-300 text-black'}`}
        />
    
        {filteredUsers.length > 0 && searchTerm && (
          <ul className={`absolute z-10 rounded mt-1 w-full ${darkMode ? 'bg-gray-700 border-gray-700 text-white' : 'bg-white border border-gray-300 text-black'}`}>
            {filteredUsers.map((user) => (
              <li 
                key={user.id} 
                className={`p-2 rounded border-b ${darkMode ? 'border-gray-600 hover:bg-gray-700 text-white' : 'border-gray-200 hover:bg-gray-100 text-black'} cursor-pointer`}
                onClick={() => navigate(`/view-profile/${user.id}`)}
              >
                {user.name}
              </li>
            ))}
          </ul>
        )}
    
        {filteredUsers.length === 0 && searchTerm && (
          <ul className={`absolute z-10 rounded mt-1 w-full ${darkMode ? 'bg-[#1F2937] border-gray-700' : 'bg-white border border-gray-300'}`}>
            <li className={`p-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No users found</li>
          </ul>
        )}
      </div>
    );
    
  
};

SearchUsers.propTypes = {
    users: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
      })
    ).isRequired,
  };
  
export default SearchUsers;