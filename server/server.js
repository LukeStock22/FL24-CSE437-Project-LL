const mysql = require('mysql2');

// Create a connection to the database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'master', // replace with your MySQL username
  password: 'password', // replace with your MySQL password
  database: 'language_app' // Use 'language_app' as the database name
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('Connection error:', err.stack);
    return;
  }
  console.log('Connected to MySQL');
});

// Example route to query the database
const express = require('express');
const app = express();

app.get('/', async (req, res) => {
  connection.query('SELECT NOW()', (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Server Error');
      return;
    }
    res.json(results);
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});