import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import mysql from 'mysql2';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

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
      console.error('Error executing SELECT query:', err); // Log the error
      return res.status(500).json({ success: false, message: 'Server error' });
    }

    if (results.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    try {
      // Hash the password before storing
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user into the database
      connection.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], (err, result) => {
        if (err) {
          console.error('Error executing INSERT query:', err); // Log the error
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
    } catch (error) {
      console.error('Error hashing password or generating token:', error); // Log any error with hashing or token generation
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
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


//FETCH MATCHES
app.get('/api/matches', authenticateToken, (req, res) => {
  const { proficientLanguage, learningLanguage } = req.query;
  const userId = req.user.id;

  connection.query(
    `SELECT u.*, 
            IF(f.status = 'pending', 'pending', 'none') AS friend_status
     FROM users u
     LEFT JOIN friendships f
       ON ((f.user1_id = u.id AND f.user2_id = ?) 
           OR (f.user2_id = u.id AND f.user1_id = ?))
     WHERE FIND_IN_SET(?, u.proficient_languages)
       AND FIND_IN_SET(?, u.learning_languages)
       AND u.id != ?
       AND (f.status IS NULL OR f.status != 'accepted')`,  // Exclude accepted friends
    [userId, userId, proficientLanguage, learningLanguage, userId],
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
// Friend request action route (accept or reject)
app.post('/api/friend-request/:id/:action', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Get token from Authorization header

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Failed to authenticate token' });
    }

    const user2_id = decoded.id; // The logged-in user
    const requestId = req.params.id; // ID of the friend request
    const action = req.params.action; // Action: 'accept' or 'reject'

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    // Update the friendship status in the database
    let status = action === 'accept' ? 'accepted' : 'rejected';
    const query = `UPDATE friendships SET status = ?, last_action_at = NOW() WHERE id = ? AND user2_id = ?`;

    connection.query(query, [status, requestId, user2_id], (err, results) => {
      if (err) {
        console.error(`Error updating friend request: ${err}`);
        return res.status(500).json({ success: false, message: 'Error processing friend request' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Friend request not found' });
      }

      res.json({ success: true, message: `Friend request ${action}ed successfully` });
    });
  });
});

// CREATE A NEW FRIEND REQUEST

// Create a new friend request
app.post('/api/friend-request', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Failed to authenticate token' });
    }

    const user1_id = decoded.id; // The ID of the user sending the friend request
    const { user2_id } = req.body; // The ID of the user to whom the friend request is being sent

    // Check if a friendship already exists
    const queryCheck = `SELECT * FROM friendships WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)`;
    connection.query(queryCheck, [user1_id, user2_id, user2_id, user1_id], (checkErr, results) => {
      if (checkErr) {
        console.error('Error checking friendship:', checkErr);
        return res.status(500).json({ success: false, message: 'Server error' });
      }

      if (results.length > 0) {
        return res.status(400).json({ success: false, message: 'Friend request already exists' });
      }

      // Insert a new friend request
      const queryInsert = `INSERT INTO friendships (user1_id, user2_id, status) VALUES (?, ?, 'pending')`;
      connection.query(queryInsert, [user1_id, user2_id], (insertErr) => {
        if (insertErr) {
          console.error('Error creating friend request:', insertErr);
          return res.status(500).json({ success: false, message: 'Error creating friend request' });
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

// GET FRIENDS
app.get('/api/friends', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }

    const userId = decoded.id;

    // Query to get the list of friends
    const query = `
      SELECT u.id, u.name 
      FROM users u
      JOIN friendships f ON (f.user1_id = u.id OR f.user2_id = u.id) AND u.id != ?
      WHERE (f.user1_id = ? OR f.user2_id = ?) AND f.status = 'accepted'
    `;

    connection.query(query, [userId, userId, userId], (err, results) => {
      if (err) {
        console.error('Error fetching friends:', err);
        return res.status(500).json({ message: 'Error fetching friends' });
      }

      res.json(results);
    });
  });
});

// GET ALL CHATS
app.get('/api/chats', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }

    const userId = decoded.id;

    const query = `
      SELECT c.id, 
             IF(c.user1_id = ?, u2.name, u1.name) AS friend_name, 
             c.last_message_at
      FROM chats c
      JOIN users u1 ON c.user1_id = u1.id
      JOIN users u2 ON c.user2_id = u2.id
      WHERE c.user1_id = ? OR c.user2_id = ?
      ORDER BY c.last_message_at DESC
    `;

    connection.query(query, [userId, userId, userId], (err, results) => {
      if (err) {
        console.error('Error fetching chats:', err);
        return res.status(500).json({ message: 'Error fetching chats' });
      }

      res.json(results);
    });
  });
});


// START NEW CHAT
app.post('/api/chats/start', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  const { friend_id } = req.body;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }

    const userId = decoded.id;

    const query = `
      INSERT INTO chats (user1_id, user2_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE last_message_at = CURRENT_TIMESTAMP`;

    connection.query(query, [userId, friend_id], (err, results) => {
      if (err) {
        console.error('Error starting chat:', err);
        return res.status(500).json({ message: 'Error starting chat' });
      }

      res.json({ success: true, chat_id: results.insertId });
    });
  });
});

// SEND MESSAGE
app.post('/api/messages/send', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  const { chat_id, message } = req.body;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }

    const userId = decoded.id;

    const query = `
      INSERT INTO messages (chat_id, sender_id, message)
      VALUES (?, ?, ?)`;

    connection.query(query, [chat_id, userId, message], (err, results) => {
      if (err) {
        console.error('Error sending message:', err);
        return res.status(500).json({ message: 'Error sending message' });
      }

      // Update the last_message_at timestamp in the chat
      connection.query(
        'UPDATE chats SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?',
        [chat_id]
      );

      res.json({ success: true });
    });
  });
});

// GET MESSAGES FOR A TASK
app.get('/api/messages/:chat_id', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  const chat_id = req.params.chat_id;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }

    const query = `
      SELECT m.id, m.sender_id, m.message, m.sent_at, u.name AS sender_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.chat_id = ?
      ORDER BY m.sent_at ASC`;

    connection.query(query, [chat_id], (err, results) => {
      if (err) {
        console.error('Error fetching messages:', err);
        return res.status(500).json({ message: 'Error fetching messages' });
      }

      res.json(results);
    });
  });
});

//VIEW PROFILE ATTEMPT NO. 1
// Route to get the profile info of a user (view profile)
app.get('/api/view-profile/:user2_id', authenticateToken, (req, res) => {
  const user2_id = req.params.user2_id;
  console.log(`Fetching profile for user ID: ${user2_id}`); // Debugging log

  // Query to fetch the user profile excluding the password
  const query = `
    SELECT id, email, name, proficient_languages, learning_languages, timezone, interests_hobbies, age
    FROM users
    WHERE id = ?`;

  connection.query(query, [user2_id], (err, result) => {
    if (err) {
      console.error('Error fetching user profile:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the profile info of the user
    res.json(result[0]);
  });
});

// Route to request a password reset

app.post('/api/password-reset-request', (req, res) => {
  const { email } = req.body;

  // Find the user in the database
  connection.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err || results.length === 0) {
      console.error('Error finding user or email not found:', err || 'Email not found');
      return res.status(400).json({ success: false, message: 'Email not found' });
    }

    const user = results[0];
    
    // Log token generation
    try {
      const resetToken = crypto.randomBytes(32).toString('hex');
      console.log('Generated Reset Token:', resetToken); // Logging the token
      const resetTokenExpiry = Date.now() + 3600000; // 1 hour

      // Save the token and expiry to the user record
      connection.query('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?', 
      [resetToken, resetTokenExpiry, user.id], (err) => {
        if (err) {
          console.error('Error saving reset token:', err);  // Add this line for logging
          return res.status(500).json({ success: false, message: 'Error saving reset token' });
        }

        // Send email with the reset link
        const transporter = nodemailer.createTransport({
          service: getMailService(email), // Dynamically set the service
          auth: {
            user: process.env.EMAIL_USER, // Load from environment variables
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptions = {
          from: process.env.EMAIL_USER, // Load email user from environment
          to: user.email,
          subject: 'Password Reset',
          text: `You requested a password reset. Click the following link to reset your password: http://localhost:3000/password-reset/${resetToken}`,
        };

        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.error('Error sending email:', err);
            return res.status(500).json({ success: false, message: 'Error sending email' });
          }

          res.json({ success: true, message: 'Password reset email sent' });
        });
      });
    } catch (error) {
      console.error('Error generating reset token:', error);
      return res.status(500).json({ success: false, message: 'Error generating reset token' });
    }
  });
});



function getMailService(email) {
  if (email.endsWith('@gmail.com')) {
    return 'Gmail';
  } else if (email.endsWith('@icloud.com')) {
    return 'iCloud';
  } else if (email.endsWith('@yahoo.com')) {
    return 'Yahoo';
  } else {
    return 'Other'; // Default case or add more conditions for other services if necessary
  }
}



app.listen(4000, () => {
  console.log('Backend server is running on port 4000');
});

