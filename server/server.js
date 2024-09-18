import mysql from 'mysql2';
import express from 'express';

// Create a connection pool to MySQL
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'main',
  password: 'password',
  port: 3306 // default port for MySQL
});

// Promisify the query method for async/await
const promisePool = pool.promise();

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Connection error', err.stack);
  } else {
    console.log('Connected to MySQL');
    connection.release(); // Release the connection back to the pool
  }
});

// Example route to query the database
const app = express();

app.get('/', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT NOW()');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
//testing