import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'master',
  password: 'password',
  database: 'language_app',
});

connection.connect((err) => {
  if (err) {
    console.error('Connection error', err.stack);
    process.exit(1); // Exit with a failure code
  } else {
    console.log('Connected to MySQL');
    process.exit(0); // Exit with success
  }
});
