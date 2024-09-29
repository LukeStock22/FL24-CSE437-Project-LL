import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import mysql from 'mysql2';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = 'veryveryclassified';

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

// Middleware to verify token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer token
  
  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

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

  // Check if the user already exists
  connection.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }

    if (results.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database
    connection.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error creating user' });
      }

      // After creating the user, generate JWT token
      const userId = result.insertId; // Get the newly created user's ID
      const token = jwt.sign({ id: userId }, SECRET_KEY, { expiresIn: '4h' }); // Generate token with the user ID

      // Send the token back to the client along with a success message
      res.json({
        success: true,
        message: 'User created successfully',
        token, // Send the JWT token
      });
    });
  });
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
      console.log('User not found');
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      console.log('Password mismatch');
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '4h' });
    console.log('Generated Token:', token);

    // Send the token back to the client
    res.json({ success: true, message: 'Login successful!', token });
  });
});

// Profile route
app.get('/api/profile', (req, res) => {
  console.log("HERE");
  const token = req.headers['authorization']?.split(' ')[1]; // Get token from header
  console.log('Token received:', token); // Debug log

  if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
          console.error('Token verification error:', err); // Debug log
          return res.status(403).json({ success: false, message: 'Failed to authenticate token' });
      }

      console.log('Decoded token:', decoded);
      const userId = decoded.id; // Get user ID from the decoded token
      console.log('Decoded user ID:', userId); // Debug log

      connection.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
          if (err) {
              console.error('Error executing query:', err);
              return res.status(500).send('Server Error');
          }
          if (results.length === 0) {
              return res.status(404).json({ success: false, message: 'User not found' });
          }

          const user = results[0];
          res.json({
              success: true, //Currently hardcoding success as we allow null values
              name: user.name,
              proficient_languages: user.proficient_languages,
              learning_languages: user.learning_languages,
              timezone: user.timezone,
              interests: user.interests_hobbies,
              age: user.age
          });
      });
  });
});


app.post('/api/profile/update', async (req, res) => {
  const { name, proficientLanguages, learningLanguages, timezone, interests, age } = req.body;
  const token = req.headers['authorization']?.split(' ')[1]; // Get token from header

  if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
          return res.status(403).json({ success: false, message: 'Failed to authenticate token' });
      }

      const userId = decoded.id; // Get user ID from the decoded token

      // Set values to null if they are empty strings
      const updatedValues = [
          name || null, // If name is an empty string, set to null
          proficientLanguages || null, // If proficientLanguages is an empty string, set to null
          learningLanguages || null, // If learningLanguages is an empty string, set to null
          timezone || null, // If timezone is an empty string, set to null
          interests || null, // If interests is an empty string, set to null
          age ? age : null, // If age is an empty string, set to null; or keep the value
          userId // User ID from the token
      ];

      // Update the user profile in the database
      connection.query(
          `UPDATE users
          SET name = ?, proficient_languages = ?, learning_languages = ?, timezone = ?, interests_hobbies = ?, age = ?
          WHERE id = ?`,
          [...updatedValues],
          (err, results) => {
              if (err) {
                  console.error('Error updating profile:', err);
                  return res.status(500).json({ success: false, message: 'Error updating profile' });
              }

              if (results.affectedRows === 0) {
                  return res.status(404).json({ success: false, message: 'User not found' });
              }

              res.json({ success: true, message: 'Profile updated successfully' });
          }
      );
  });
});


//Fetch matches
app.get('/api/matches', authenticateToken, (req, res) => {
  const { proficientLanguage, learningLanguage } = req.query;

  connection.query(
    'SELECT * FROM users WHERE FIND_IN_SET(?, proficient_languages) AND FIND_IN_SET(?, learning_languages)',
    [proficientLanguage, learningLanguage],
    (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).send('Server Error');
      }
      res.json(results);
    }
  );
});

// FRIEND REQUEST
app.post('/api/friend-request', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Get token from Authorization header

  console.log("Friend Request Route Hit");

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Failed to authenticate token' });
    }

    const user1_id = decoded.id; // The user who is sending the friend request
    const { user2_id } = req.body; // The user receiving the friend request

    // Check if the friendship already exists
    const queryCheck = `SELECT * FROM friendships WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)`;
    connection.query(queryCheck, [user1_id, user2_id, user2_id, user1_id], (checkErr, checkResults) => {
      if (checkErr) {
        console.error('Error checking friendship:', checkErr);
        return res.status(500).json({ success: false, message: 'Error checking friendship' });
      }

      if (checkResults.length > 0) {
        return res.status(400).json({ success: false, message: 'Friendship request already exists or users are already friends' });
      }

      // Insert a new friendship with status 'pending'
      const queryInsert = `INSERT INTO friendships (user1_id, user2_id, status) VALUES (?, ?, 'pending')`;
      connection.query(queryInsert, [user1_id, user2_id], (insertErr, insertResults) => {
        if (insertErr) {
          console.error('Error inserting friendship:', insertErr);
          return res.status(500).json({ success: false, message: 'Error sending friend request' });
        }

        res.json({ success: true, message: 'Friend request sent successfully' });
      });
    });
  });
});

//FETCH NOTIFICATIONS ROUTE
app.get('/api/notifications', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Get token from Authorization header

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }

    const user2_id = decoded.id; // The logged-in user (the receiver of the friend requests)

    // Query to fetch pending friend requests for the current user
    const query = `SELECT f.id, f.user1_id, u.name AS user1_name FROM friendships f
                   JOIN users u ON f.user1_id = u.id
                   WHERE f.user2_id = ? AND f.status = 'pending'`;
    connection.query(query, [user2_id], (err, results) => {
      if (err) {
        console.error('Error fetching notifications:', err);
        return res.status(500).json({ message: 'Error fetching notifications' });
      }

      res.json(results); // Send notifications (pending friend requests) to the client
    });
  });
});



app.listen(4000, () => {
  console.log('Backend server is running on port 4000');
});

