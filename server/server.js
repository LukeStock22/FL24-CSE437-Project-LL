const { Pool } = require('pg');

const pool = new Pool({
  user: 'master',
  host: 'localhost',
  database: 'main',
  password: 'password',
  port: 5432,  // default port for PostgreSQL
});

pool.connect((err) => {
  if (err) {
    console.error('Connection error', err.stack);
  } else {
    console.log('Connected to PostgreSQL');
  }
  console.log('Connected to MySQL');
});

// Example route to query the database
const app = express();

app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
