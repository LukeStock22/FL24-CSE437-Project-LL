# Project Name: Language Learning App Incoming Deluxe
### Team members: Luke Stockbridge, Sylvia Kozub, Annabel Lee
### TA: Professor

### Instructions/Link to access: <insert here>


# TABLES TO ADD IN DB #

CREATE USER 'shared_user'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON your_database_name.* TO 'shared_user'@'%';
FLUSH PRIVILEGES;

# create user table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL
);

# users table fields to add

ALTER TABLE users
ADD COLUMN name VARCHAR(255),
ADD COLUMN proficient_languages VARCHAR(255),
ADD COLUMN learning_languages VARCHAR(255),
ADD COLUMN timezone VARCHAR(255),
ADD COLUMN interests_hobbies TEXT,
ADD COLUMN age INT;



# IN SERVER
npm install jsonwebtoken
- Secret key currently hard coded, should be moved to a .env file

# SQL that can be used to check friendship
SELECT * FROM friendships
WHERE (user1_id = ? AND user2_id = ?)
   OR (user1_id = ? AND user2_id = ?)
   AND status = 'accepted';

# FRIENDSHIPS TABLE
CREATE TABLE friendships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user1_id INT NOT NULL,
    user2_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected', 'blocked') DEFAULT 'pending',
    last_action_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user1_id) REFERENCES users(id),
    FOREIGN KEY (user2_id) REFERENCES users(id),
    UNIQUE KEY unique_friendship (user1_id, user2_id)
);

# messages

CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chat_id INT NOT NULL,
    sender_id INT NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats(id),
    FOREIGN KEY (sender_id) REFERENCES users(id)
);

# chats

CREATE TABLE chats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user1_id INT NOT NULL,
    user2_id INT NOT NULL,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_chat (user1_id, user2_id),
    FOREIGN KEY (user1_id) REFERENCES users(id),
    FOREIGN KEY (user2_id) REFERENCES users(id)
);

# TODO
- Once you send a friend request, change "Add Friend" button to "Pending" and disable ability to press button
- Add more filter options to matching section
- Default filters for proficient language and learning language based on currnet users languages
- Transfer messaging over to Socket.io

# TODO for MVP
- password reset

# TAILWIND
npm install tailwindcss postcss autoprefixer

npx tailwindcss init -p

 Line 32 in webpack.config.js use: ['style-loader', 'css-loader', 'postcss-loader'],

# this should be downloaded for drop down select
npm install react-select

# socket.io setup 
- in server : npm install socket.io
- in client: npm install socket.io-client
