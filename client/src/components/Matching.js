import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Matching = () => {
  const [proficientLanguage, setProficientLanguage] = useState('');
  const [learningLanguage, setLearningLanguage] = useState('');
  const [matches, setMatches] = useState([]);

  const languageOptions = ['English', 'Spanish', 'French', 'Polish', 'Italian', 'Mandarin', 'German', 'Hindi', 'Russian'];

  useEffect(() => {
    const fetchMatches = () => {
      const token = localStorage.getItem('token'); // Get token from localStorage
      fetch(`http://localhost:4000/api/matches?proficientLanguage=${proficientLanguage}&learningLanguage=${learningLanguage}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Include the token in the Authorization header
        },
      })
      .then((response) => {
        if (response.status === 401) {
          alert('Unauthorized. Please log in.');
          // Handle unauthorized access, e.g., redirect to login
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

  return (
    <div>
      <h2>Matching</h2>
      <div>
        <label>Proficient Language: </label>
        <select value={proficientLanguage} onChange={(e) => setProficientLanguage(e.target.value)}>
          <option value="">Select</option>
          {languageOptions.map((lang) => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Learning Language: </label>
        <select value={learningLanguage} onChange={(e) => setLearningLanguage(e.target.value)}>
          <option value="">Select</option>
          {languageOptions.map((lang) => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>
      <div>
        <h3>Matches</h3>
        <ul>
          {matches.length > 0 ? (
            matches.map((match) => (
              <li key={match.id}>{match.name} - {match.proficient_languages} - {match.learning_languages}</li>
            ))
          ) : (
            <p>No matches found</p>
          )}
        </ul>
      </div>
      <Link to="/home">
        <button>Home</button>
      </Link>
    </div>
  );
};

export default Matching;

