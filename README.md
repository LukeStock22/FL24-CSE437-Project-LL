# Project Name: Language Learning App Incoming Deluxe
### Team members: Luke Stockbridge, Sylvia Kozub, Annabel Lee
### TA: Professor

### Instructions/Link to access: <insert here>


# TABLES TO ADD IN DB #

CREATE USER 'shared_user'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON your_database_name.* TO 'shared_user'@'%';
FLUSH PRIVILEGES;

