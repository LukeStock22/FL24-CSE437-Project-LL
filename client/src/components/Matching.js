import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Matching = () => {
  const [proficientLanguage, setProficientLanguage] = useState('');
  const [learningLanguage, setLearningLanguage] = useState('');
  const [matches, setMatches] = useState([]);

  const languageOptions = ['English', 'Spanish', 'French', 'Polish', 'Italian', 'Mandarin', 'German', 'Hindi', 'Russian'];

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
        })
        .catch((error) => {
          console.error('Error fetching matches:', error);
        });
    };

    if (proficientLanguage && learningLanguage) {
      fetchMatches();
    }
  }, [proficientLanguage, learningLanguage]);

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
          alert(`Friend request sent to user ${user2_id}`);
        } else {
          alert(data.message);
        }
      })
      .catch((error) => {
        console.error('Error sending friend request:', error);
      });
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

      <div>
        <h3 className="text-2xl font-bold mb-4">Matches</h3>
        <ul>
          {matches.length > 0 ? (
            matches.map((match) => (
              <li key={match.id} className="mb-4 p-4 bg-white rounded shadow">
                <p>{match.name} - {match.proficient_languages} - {match.learning_languages}</p>
                <div className="mt-2">
                  <button
                    onClick={() => alert(`View Profile of ${match.name}`)}
                    className="bg-blue-500 text-white py-1 px-4 rounded mr-2 hover:bg-blue-600"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => handleAddFriend(match.id)}
                    className="bg-green-500 text-white py-1 px-4 rounded hover:bg-green-600"
                  >
                    Add Friend
                  </button>
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
