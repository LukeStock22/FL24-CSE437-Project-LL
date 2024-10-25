CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL
);

ALTER TABLE users
ADD COLUMN name VARCHAR(255),
ADD COLUMN proficient_languages VARCHAR(255),
ADD COLUMN learning_languages VARCHAR(255),
ADD COLUMN timezone VARCHAR(255),
ADD COLUMN interests_hobbies TEXT,
ADD COLUMN age INT;

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

CREATE TABLE chats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user1_id INT NOT NULL,
    user2_id INT NOT NULL,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_chat (user1_id, user2_id),
    FOREIGN KEY (user1_id) REFERENCES users(id),
    FOREIGN KEY (user2_id) REFERENCES users(id)
);

CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chat_id INT NOT NULL,
    sender_id INT NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats(id),
    FOREIGN KEY (sender_id) REFERENCES users(id)
);

CREATE TABLE blocks ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    blocker_id INT NOT NULL, 
    blocked_id INT NOT NULL, 
    FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE, 
    FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE, 
    UNIQUE KEY (blocker_id, blocked_id) 
);