import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Select from 'react-select';

const Matching = () => {
  const [proficientLanguage, setProficientLanguage] = useState('');
  const [learningLanguage, setLearningLanguage] = useState('');
  const [matches, setMatches] = useState([]);
  const [timezones, setTimezones] = useState([]);
  const [ages, setAges] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [blockedByUsers, setBlockedByUsers] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);

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
    // filtering matches to exclude blocked by users
    const filtered = matches.filter((match) => !blockedByUsers.includes(match.id));
    setFilteredMatches(filtered);
  }, [matches, blockedByUsers]);

  useEffect(() => {
    // filtering matches to exclude blocked users
    const filtered = matches.filter((match) => !blockedUsers.includes(match.id));
    setFilteredMatches(filtered);
  }, [matches, blockedUsers]);


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
    <div className="min-h-screen bg-gray-100 p-8">
      <h2 className="text-3xl font-bold mb-6">Matching</h2>
      
      <div className="mb-4">
        <label className="block mb-2">Proficient Language:</label>
        <select
          value={proficientLanguage}
          onChange={(e) => setProficientLanguage(e.target.value)}
          className="p-2 border border-gray-300 rounded w-full"
        >
          <option value="">Select</option>
          {languageOptions.map((lang) => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="block mb-2">Learning Language:</label>
        <select
          value={learningLanguage}
          onChange={(e) => setLearningLanguage(e.target.value)}
          className="p-2 border border-gray-300 rounded w-full"
        >
          <option value="">Select</option>
          {languageOptions.map((lang) => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>
      <div className = "mb-10 flex space-x-4">
        <div className="w-1/2">
          <label className="block mb-2">Timezones:</label>
          <Select
            isMulti 
            options={timezoneOptions} 
            value={timezones}  
            onChange={(selectedOptions) => setTimezones(selectedOptions)}
            className="basic-multi-select"
            classNamePrefix="select"
            placeholder="Select"
          />
        </div>

        <div className="w-1/2">
          <label className="block mb-2">Age:</label>
          <Select
            isMulti 
            options={ageOptions} 
            value={ages}  
            onChange={(selectedOptions) => setAges(selectedOptions)}
            className="basic-multi-select"
            classNamePrefix="select"
            placeholder="Select"
          />
        </div>

      </div>

      <div>
        <h3 className="text-2xl font-bold mb-4">Matches</h3>
        <ul>
          {filteredMatches.length > 0 ? (
            filteredMatches.map((match) => (
              <li key={match.id} className="mb-4 p-4 bg-white rounded shadow">
                <p>{match.name} - {match.proficient_languages} - {match.learning_languages} - {match.timezone}</p>
                <div className="mt-2">
                  <button
                    onClick={() => navigate(`/view-profile/${match.id}`)}
                    className="bg-blue-500 text-white py-1 px-4 rounded mr-2 hover:bg-blue-600"
                  >
                    View Profile
                  </button>
                  {match.friend_status === 'pending' ? (
                    <button
                      className="bg-gray-500 text-white py-1 px-4 rounded cursor-not-allowed"
                      disabled
                    >
                      Pending
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAddFriend(match.id)}
                      className="bg-green-500 text-white py-1 px-4 rounded hover:bg-green-600"
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

      <Link to="/home">
        <button className="mt-6 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600">
          Home
        </button>
      </Link>
    </div>
  );
};

export default Matching;
