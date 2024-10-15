import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import mysql from 'mysql2';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
//import 'dotenv/config';
import sgMail from '@sendgrid/mail';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
const router = express.Router();
dotenv.config();



const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } }); // Initialize Socket.IO

app.use(express.json());
app.use(cors());


const SECRET_KEY = 'veryveryclassified';


const CLIENT_ID = '1067721697571-0s5nj85n2o6nqsj9momo6bjtpe1m50qk.apps.googleusercontent.com'; // Add your Client ID
const client = new OAuth2Client(CLIENT_ID);

//PUT SENDGRID API KEY HERE
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

    // Query to get the list of friends along with their chat_id
    const query = `
      SELECT u.id, u.name, c.id AS chat_id
      FROM users u
      JOIN friendships f ON (f.user1_id = u.id OR f.user2_id = u.id) AND u.id != ?
      LEFT JOIN chats c ON (c.user1_id = u.id OR c.user2_id = u.id) 
                         AND (c.user1_id = ? OR c.user2_id = ?)
      WHERE (f.user1_id = ? OR f.user2_id = ?) AND f.status = 'accepted'
    `;

    connection.query(query, [userId, userId, userId, userId, userId], (err, results) => {
      if (err) {
        console.error('Error fetching friends:', err);
        return res.status(500).json({ message: 'Error fetching friends' });
      }

      res.json(results); // Send friends with chat_id
    });
  });
});

// Remove friend
app.delete('/api/removeFriend/:friendId', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  const friendId = req.params.friendId; 

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }

    const userId = decoded.id;

    const query = `
      DELETE FROM friendships 
      WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
    `;

    connection.query(query, [userId, friendId, friendId, userId], (err, results) => {
      if (err) {
        console.error('Error removing friend:', err);
        return res.status(500).json({ message: 'Error removing friend' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Friendship not found' });
      }

      res.json({ message: 'Friend removed successfully' });
    });
  });
});

// Socket.IO message handling
io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  // Listen for a user joining the chat
  socket.on('join_chat', ({ chat_id, user_id }) => {
      socket.join(chat_id);
      console.log(`User ${user_id} joined chat ${chat_id}`);
  });

  // Listen for incoming messages
  socket.on('send_message', (messageData) => {
    const { chat_id, message, sender_id } = messageData;
  
    // Query to get sender's name from the users table
    const getSenderNameQuery = 'SELECT name FROM users WHERE id = ?';
  
    connection.query(getSenderNameQuery, [sender_id], (err, result) => {
      if (err) {
        console.error('Error fetching sender name:', err);
        return;
      }
  
      const sender_name = result[0].name; // Fetch sender's name
  
      // Save the message to the database
      const query = 'INSERT INTO messages (chat_id, sender_id, message) VALUES (?, ?, ?)';
      connection.query(query, [chat_id, sender_id, message], (err) => {
        if (err) {
          console.error('Error saving message:', err);
          return;
        }
  
        // Broadcast the message to everyone in the chat room
        io.to(chat_id).emit('receive_message', {
          chat_id,
          sender_name, // Use the fetched sender_name from the database
          message,
          sender_id
        });
      });
    });
  });
  



  socket.on('disconnect', () => {
      console.log('user disconnected', socket.id);
  });
});



// GET ALL CHATS
// GET ALL CHATS (with last message)
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


   // Modify the query to include the most recent message from the messages table
   const query = `
     SELECT c.id,
            IF(c.user1_id = ?, u2.name, u1.name) AS friend_name,
            m.message AS last_message,
            m.sent_at AS last_message_time,
            IF(c.user1_id = ?, c.user2_id, c.user1_id) AS friend_id
     FROM chats c
     JOIN users u1 ON c.user1_id = u1.id
     JOIN users u2 ON c.user2_id = u2.id
     LEFT JOIN messages m ON m.id = (
       SELECT m2.id
       FROM messages m2
       WHERE m2.chat_id = c.id
       ORDER BY m2.sent_at DESC
       LIMIT 1
     )
     WHERE c.user1_id = ? OR c.user2_id = ?
     ORDER BY m.sent_at DESC;
   `;


   connection.query(query, [userId, userId, userId, userId], (err, results) => {
     if (err) {
       console.error('Error fetching chats:', err);
       return res.status(500).json({ message: 'Error fetching chats' });
     }


     res.json(results);
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

// Create a new chat
app.post('/api/chats/start', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Get the token from the Authorization header
  const { friend_id } = req.body; // The ID of the friend to start a chat with

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }

    const userId = decoded.id; // The logged-in user's ID

    // Check if a chat already exists between the two users
    const checkChatQuery = `SELECT * FROM chats WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)`;

    connection.query(checkChatQuery, [userId, friend_id, friend_id, userId], (err, results) => {
      if (err) {
        console.error('Error checking for existing chat:', err);
        return res.status(500).json({ message: 'Error checking for existing chat' });
      }

      if (results.length > 0) {
        // If a chat already exists, return the chat info
        return res.json({ success: true, chat_id: results[0].id });
      }

      // Otherwise, create a new chat
      const createChatQuery = 'INSERT INTO chats (user1_id, user2_id) VALUES (?, ?)';

      connection.query(createChatQuery, [userId, friend_id], (err, result) => {
        if (err) {
          console.error('Error creating chat:', err);
          return res.status(500).json({ message: 'Error creating chat' });
        }

        // Return the newly created chat's ID
        res.json({ success: true, chat_id: result.insertId });
      });
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


// Password Reset Request Route
app.post('/api/password-reset-request', (req, res) => {
 const { email } = req.body;


 // Find the user in the database
 connection.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
   if (err || results.length === 0) {
     return res.status(400).json({ success: false, message: 'Email not found' });
   }


   const user = results[0];
   const resetToken = crypto.randomBytes(32).toString('hex');
   const resetTokenExpiry = Date.now() + 3600000; // Token expires in 1 hour


   // Save the token and expiry to the user's record
   connection.query(
     'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
     [resetToken, resetTokenExpiry, user.id],
     (err) => {
       if (err) {
         console.error('Error saving reset token:', err);
         return res.status(500).json({ success: false, message: 'Error saving reset token' });
       }


       // Prepare the email message
       const msg = {
         to: user.email,  // Send to the user's email
         from: 'k.sylvia@wustl.edu',  // Your verified SendGrid sender email
         subject: 'Password Reset',
         text: `You requested a password reset. Click the following link to reset your password: http://localhost:3000/password-reset/${resetToken}`,
       };


       // Send the password reset email using SendGrid
       sgMail.send(msg)
         .then(() => {
           res.json({ success: true, message: 'Password reset email sent' });
         })
         .catch((error) => {
           console.error('Error sending email:', error);
           res.status(500).json({ success: false, message: 'Error sending email' });
         });
     }
   );
 });
});


app.post('/api/password-reset/:token', async (req, res) => {
 const { token } = req.params;  // Get the reset token from the URL
 const { newPassword } = req.body;  // Get the new password from the request body


 // Find the user by the reset token
 connection.query('SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > ?', [token, Date.now()], async (err, results) => {
   if (err || results.length === 0) {
     return res.status(400).json({ success: false, message: 'Invalid or expired token' });
   }


   const user = results[0];


   try {
     // Hash the new password
     const hashedPassword = await bcrypt.hash(newPassword, 10);


     // Update the user's password in the database
     connection.query(
       'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
       [hashedPassword, user.id],
       (err) => {
         if (err) {
           console.error('Error updating password:', err);
           return res.status(500).json({ success: false, message: 'Error updating password' });
         }


         // Password successfully updated
         res.json({ success: true, message: 'Password updated successfully' });
       }
     );
   } catch (error) {
     console.error('Error hashing password:', error);
     res.status(500).json({ success: false, message: 'Server error' });
   }
 });
});

//Block user 
// app.post('/api/block/:userId', (req, res) => {
//   const token = req.headers['authorization']?.split(' ')[1];
//   if (!token) {
//     return res.status(401).json({ success: false, message: 'No token provided' });
//   }

//   jwt.verify(token, SECRET_KEY, (err, decoded) => {
//       if (err) {
//           return res.status(403).json({ success: false, message: 'Failed to authenticate token' });
//       }

//       const blockerId = decoded.id; //ID of user doing the blocking
//       const blockedUserId = req.body.userId; //ID of user being blocked

//       if (!blockedUserId) {
//         return res.status(400).json({ success: false, message: 'User ID to block is required' });
//       }

//       const query = `
//         INSERT INTO blocks (blocker_id, blocked_user_id)
//         VALUES (?, ?);
//       `;

//       connection.query(query, [blockerId, blockedUserId], (err, result) => {
//         if (err) {
//           console.error('Error blocking user:', err);
//           return res.status(500).json({ success: false, message: 'Error blocking user' });
//         }
  
//         res.json({ success: true, message: 'User blocked successfully' });
//       });
//   });
// });

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
 console.log(`Backend server is running on port ${PORT}`);
});
