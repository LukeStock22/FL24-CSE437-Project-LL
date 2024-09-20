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

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
