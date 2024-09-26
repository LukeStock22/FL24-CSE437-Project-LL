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

