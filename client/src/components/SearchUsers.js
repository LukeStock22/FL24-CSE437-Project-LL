import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';

const SearchUsers = ({users}) => { 
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(users); 

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    console.log("here users", users)

    if (term) {
        console.log("term: ", term)
        const filtered = users.filter((user) =>
          user.name.toLowerCase().includes(term)
        );
        console.log("filtered:", filtered)
        setFilteredUsers(filtered);
      } else {
        setFilteredUsers([]); 
      }
  };

  const navigate = useNavigate();

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Search users"
        value={searchTerm}
        onChange={handleSearch}
        className="border border-gray-300 rounded p-2 w-full text-black"
      />
      
      {filteredUsers.length > 0 && searchTerm && (
        <ul className="absolute z-10 bg-white border border-gray-300 rounded mt-1 w-full">
          {filteredUsers.map((user) => (
            <li key={user} 
                className="p-2 border-b border-gray-200 hover:bg-gray-100 cursor-pointer text-black"
                onClick={() => navigate(`/view-profile/${user.id}`)}>
              {user.name}
            </li>
          ))}
        </ul>
      )}
      
      {filteredUsers.length === 0 && searchTerm && (
        <ul className="absolute z-10 bg-white border border-gray-300 rounded mt-1 w-full">
          <li className="p-2 text-gray-500">No users found</li>
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