import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import mysql from 'mysql2';

const app = express();
app.use(express.json());
app.use(cors());

const CLIENT_ID = '1067721697571-0s5nj85n2o6nqsj9momo6bjtpe1m50qk.apps.googleusercontent.com'; // Add your Client ID
const client = new OAuth2Client(CLIENT_ID);

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'master',
  password: 'password',
  database: 'language_app',
});

connection.connect((err) => {
  if (err) {
    console.error('Connection error', err.stack);
  } else {
    console.log('Connected to MySQL');
  }
});

// Route for Google OAuth login verification
app.post('/api/google-login', async (req, res) => {
  const { token } = req.body;
  
  try {
    // Verify the token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    });

    const payload = ticket.getPayload();
    const { email } = payload;

    // Check if the user exists in the database
    connection.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).send('Server Error');
      }

      if (results.length > 0) {
        res.json({ success: true, message: 'User logged in successfully!' });
      } else {
        // Insert new user into the database if they don't exist
        connection.query(
          'INSERT INTO users (email) VALUES (?)',
          [email],
          (err, results) => {
            if (err) {
              console.error('Error executing query:', err);
              return res.status(500).send('Server Error');
            }
            res.json({ success: true, message: 'New user created and logged in!' });
          }
        );
      }
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ success: false, message: 'Invalid Google Token' });
  }
});

// Signup route
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  connection.query(
    'INSERT INTO users (email, password) VALUES (?, ?)',
    [email, hashedPassword],
    (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).send('Server Error');
      }
      res.json({ success: true });
    }
  );
});

// Login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  connection.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).send('Server Error');
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({ success: true, message: 'Login successful!' });
  });
});

// Profile route
app.get('/api/profile', async (req, res) => {
  const userId = 1; // Replace with actual logged in user ID once sessions/tokens in use
  try {
    connection.query(
      'SELECT name, proficient_languages, learning_languages, timezone, interests_hobbies, age FROM users WHERE id = ?',
      [userId],
      (err, results) => {
        if (err) {
          console.error('Error executing query:', err);
          return res.status(500).send('Error fetching profile');
        }

        if (results.length === 0) {
          return res.status(404).send('Profile not found');
        }

        res.json(results[0]);
      }
    );
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).send('Error fetching profile');
  }
});

//Update profile
app.post('/api/profile/update', async (req, res) => {
  const { name, proficientLanguages, learningLanguages, timezone, interests, age } = req.body;
  const userId = 1; // Replace with actual logged in user ID once sessions/tokens in use

  try {
    connection.query(
      `UPDATE users
      SET name = ?, proficient_languages = ?, learning_languages = ?, timezone = ?, interests_hobbies = ?, age = ?
      WHERE id = ?`,
      [name, proficientLanguages, learningLanguages, timezone, interests, age, userId],
      (err, results) => {
        if (err) {
          console.error('Error updating profile:', err);
          return res.status(500).send('Error updating profile');
        }

        res.send('Profile updated successfully');
      }
    );
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).send('Error updating profile');
  }
});

app.listen(4000, () => {
  console.log('Backend server is running on port 4000');
});

