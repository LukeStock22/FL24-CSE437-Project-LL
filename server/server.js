import mysql from 'mysql2';
import express from 'express';

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'master',
  password: 'password',
  database: 'language_app', // Use 'languageapp' as the database name
});

connection.connect((err) => {
  if (err) {
    console.error('Connection error', err.stack);
  } else {
    console.log('Connected to MySQL');
  }
});

const app = express();

app.get('/', async (req, res) => {
  try {
    connection.query('SELECT NOW()', (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Server Error');
        return;
      }
      res.json(results);
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
