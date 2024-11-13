import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import Navbar from './Navbar';
import { DarkModeContext } from './DarkModeContext'; 

const Matching = () => {
  const [proficientLanguage, setProficientLanguage] = useState('');
  const [learningLanguage, setLearningLanguage] = useState('');
  const [matches, setMatches] = useState([]);
  const [timezones, setTimezones] = useState([]);
  const [ages, setAges] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [blockedByUsers, setBlockedByUsers] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const { darkMode, setDarkMode } = useContext(DarkModeContext); 

  const languageOptions = ['English', 'Spanish', 'French', 'Polish', 'Italian', 'Mandarin', 'German', 'Hindi', 'Russian'];
  const timezoneOptions = [
    { value: 'EST', label: 'EST (Eastern Standard Time)' },
    { value: 'CST', label: 'CST (Central Standard Time)' },
    { value: 'PST', label: 'PST (Pacific Standard Time)' }
  ];
  const ageOptions = [
    { value: '18-24', label: '18-24' },
    { value: '25-34', label: '25-34' },
    { value: '35-44', label: '35-44' },
    { value: '45-54', label: '45-54' },
    { value: '55-64', label: '55-64' },
    { value: '65+', label: '65+' }
  ];

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch logged-in user's languages to autopopulate the filters
    const fetchUserLanguages = () => {
      const token = localStorage.getItem('token');
      fetch('http://localhost:4000/api/profile', {  // Updated endpoint
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          // Ensure the response contains the expected fields
          if (data.success) {
            setProficientLanguage(data.learning_languages); // Set the user's learning language to the proficient language dropdown
            setLearningLanguage(data.proficient_languages);     // Updated to match API response
          } else {
            console.error('Error fetching user languages:', data.message);
          }
        })
        .catch((error) => {
          console.error('Error fetching user languages:', error);
        });
    };

    fetchUserLanguages();
  }, []);

  useEffect(() => {
    const fetchMatches = () => {
      const token = localStorage.getItem('token');
      fetch(`http://localhost:4000/api/matches?proficientLanguage=${proficientLanguage}&learningLanguage=${learningLanguage}`, {
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
          setMatches(data);
          setFilteredMatches(data);
        })
        .catch((error) => {
          console.error('Error fetching matches:', error);
        });
    };

    if (proficientLanguage && learningLanguage) {
      fetchMatches();
    }
  }, [proficientLanguage, learningLanguage]);

  useEffect(() => {
    handleTimezoneFilter(); 
  }, [timezones]);

  useEffect(() => {
    handleAgesFilter(); 
  }, [ages]);

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
            console.log("blocked by: ", data.blockedBy)
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

  // getting list of users who current user has blocked
  useEffect(() => {
    const fetchBlocked = () => {
      const token = localStorage.getItem('token');
      fetch('http://localhost:4000/api/blocked', {
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
            console.log("blocked: ", data.blocked)
            setBlockedUsers(data.blocked); //list of blocked by user IDs
          } else {
            console.error('Error fetching blocked users:', data.message);
          }
        })
        .catch((error) => {
          console.error('Error fetching blocked users:', error);
        });
    };
    fetchBlocked();
  }, []);

  useEffect(() => {
    // Combine both block lists and filter out matches with IDs in either list
    const filtered = matches.filter(
      (match) => !blockedByUsers.includes(match.id) && !blockedUsers.includes(match.id)
    );
    console.log("blocked/blocked by filtered matches:", filtered);
    setFilteredMatches(filtered);
  }, [matches, blockedByUsers, blockedUsers]);


  const handleAddFriend = (user2_id) => {
    const token = localStorage.getItem('token');
  
    fetch('http://localhost:4000/api/friend-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ user2_id }),
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
          // Immediately update the match's friend status to 'pending'
          setMatches((prevMatches) => 
            prevMatches.map((match) => 
              match.id === user2_id ? { ...match, friend_status: 'pending' } : match
            )
          );
        } else {
          alert(data.message);
        }
      })
      .catch((error) => {
        console.error('Error sending friend request:', error);
      });
  };

  const handleTimezoneFilter = (e) => {
    if (timezones.length === 0) {
      setFilteredMatches(matches);
    } else {
      const selectedTimezones = timezones.map((tz) => tz.value);
      const filtered = matches.filter((match) => selectedTimezones.includes(match.timezone));
      setFilteredMatches(filtered);
    }
  };

  const handleAgesFilter = (e) => {
    if (ages.length === 0) {
      setFilteredMatches(matches);
    } else {
      const filtered = matches.filter((match) => {
        return ages.some((ageRange) => {
          const [minAge, maxAge] = ageRange.value.split('-').map(Number);
          if (maxAge) {
            return match.age >= minAge && match.age <= maxAge;
          }
          return match.age >= minAge;
        });
      });
  
      setFilteredMatches(filtered);
    }
  };

  return (
    <div>
      <Navbar />
      <div className={`min-h-screen p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
        <h2 className="text-3xl font-bold mb-6">Matching</h2>
  
        <div className="mb-4">
          <label className={`block mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Proficient Language:</label>
          <select
            value={proficientLanguage}
            onChange={(e) => setProficientLanguage(e.target.value)}
            className={`p-2 border rounded w-full ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'}`}
          >
            <option value="">Select</option>
            {languageOptions.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
  
        <div className="mb-6">
          <label className={`block mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Learning Language:</label>
          <select
            value={learningLanguage}
            onChange={(e) => setLearningLanguage(e.target.value)}
            className={`p-2 border rounded w-full ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'}`}
          >
            <option value="">Select</option>
            {languageOptions.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
        <div className="mb-10 flex space-x-4">
          <div className="w-1/2">
            <label className={`block mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Timezones:</label>
            <Select
              isMulti
              options={timezoneOptions}
              value={timezones}
              onChange={(selectedOptions) => setTimezones(selectedOptions)}
              placeholder="Select"
              className="basic-multi-select"
              classNamePrefix="select"
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                  color: darkMode ? '#FFFFFF' : '#000000',
                  borderColor: darkMode ? '#4A5568' : '#E2E8F0',
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                  color: darkMode ? '#FFFFFF' : '#000000',
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused
                    ? darkMode ? '#1A202C' : '#E2E8F0'
                    : darkMode ? '#2D3748' : '#FFFFFF',
                  color: darkMode ? (state.isFocused ? '#CBD5E0' : '#FFFFFF') : (state.isFocused ? '#4A5568' : '#000000'),
                  cursor: 'pointer',
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: darkMode ? '#4A5568' : '#CBD5E0',
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: darkMode ? '#FFFFFF' : '#000000',
                }),
                placeholder: (base) => ({
                  ...base,
                  color: darkMode ? '#A0AEC0' : '#718096',
                }),
                singleValue: (base) => ({
                  ...base,
                  color: darkMode ? '#FFFFFF' : '#000000',
                }),
              }}
            />
          </div>

          <div className="w-1/2">
            <label className={`block mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Age:</label>
            <Select
              isMulti
              options={ageOptions}
              value={ages}
              onChange={(selectedOptions) => setAges(selectedOptions)}
              placeholder="Select"
              className="basic-multi-select"
              classNamePrefix="select"
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                  color: darkMode ? '#FFFFFF' : '#000000',
                  borderColor: darkMode ? '#4A5568' : '#E2E8F0',
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                  color: darkMode ? '#FFFFFF' : '#000000',
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused
                    ? darkMode ? '#1A202C' : '#E2E8F0'
                    : darkMode ? '#2D3748' : '#FFFFFF',
                  color: darkMode ? (state.isFocused ? '#CBD5E0' : '#FFFFFF') : (state.isFocused ? '#4A5568' : '#000000'),
                  cursor: 'pointer',
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: darkMode ? '#4A5568' : '#CBD5E0',
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: darkMode ? '#FFFFFF' : '#000000',
                }),
                placeholder: (base) => ({
                  ...base,
                  color: darkMode ? '#A0AEC0' : '#718096',
                }),
                singleValue: (base) => ({
                  ...base,
                  color: darkMode ? '#FFFFFF' : '#000000',
                }),
              }}
            />
          </div>
        </div>

  
        <div>
          <h3 className="text-2xl font-bold mb-4">Matches</h3>
          <ul>
            {filteredMatches.length > 0 ? (
              filteredMatches.map((match) => (
                <li key={match.id} className={`mb-4 p-4 rounded shadow ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
                  <p>{match.name} - {match.proficient_languages} - {match.learning_languages} - {match.timezone}</p>
                  <div className="mt-2">
                    <button
                      onClick={() => navigate(`/view-profile/${match.id}`)}
                      className={`py-1 px-4 rounded mr-2 ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                    >
                      View Profile
                    </button>
                    {match.friend_status === 'pending' ? (
                      <button
                        className={`py-1 px-4 rounded cursor-not-allowed ${darkMode ? 'bg-gray-600 text-white' : 'bg-gray-300 text-black'}`}
                        disabled
                      >
                        Pending
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddFriend(match.id)}
                        className={`py-1 px-4 rounded ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
                      >
                        Add Friend
                      </button>
                    )}
                  </div>
                </li>
              ))
            ) : (
              <p>No matches found</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Matching;
