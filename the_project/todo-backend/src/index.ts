import express from 'express';
import { Pool } from 'pg';
import morgan from 'morgan';

const app = express();
const PORT = process.env.PORT;

const PGHOST = process.env.PGHOST;
const PGUSER = process.env.PGUSER;
const PGPASSWORD = process.env.PGPASSWORD;
const PGDATABASE = process.env.PGDATABASE;
const PGPORT = process.env.PGPORT;

const pool = new Pool({
  host: PGHOST,
  user: PGUSER,
  password: PGPASSWORD,
  database: PGDATABASE,
  port: PGPORT ? parseInt(PGPORT, 10) : undefined,
});

const initDb = async (retries=3, delay=3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      await client.query(`
        CREATE TABLE IF NOT EXISTS todos (
          id SERIAL PRIMARY KEY,
          todo TEXT NOT NULL CHECK (LENGTH(todo) > 0 AND LENGTH(todo) <= 140)
        );
      `);
      client.release();
      console.log('Database initialized!');
      return;
    } catch (err) {
      console.error(`Database not ready, retrying in ${delay / 1000}s...`, err);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error('Failed to initialize database after multiple attempts');
};

initDb();

app.use(morgan('combined'));
app.use(express.json());

app.get('/', async (_req, res) => {
  const client = await pool.connect();
  const result = await client.query('SELECT todo FROM todos');
  res.json(result.rows.map(row => row.todo));
  client.release();
});

app.post('/', async (req, res) => {
  const todo = req.body.todo;
  if (typeof todo === 'string' && todo.length > 0 && todo.length <= 140) {
    const client = await pool.connect();
    await client.query('INSERT INTO todos (todo) VALUES ($1)', [todo]);
    console.log(`New todo added: "${todo}"`);
    res.status(201).end();
    client.release();
  } else {
    console.warn(`Rejected todo: "${todo}" (length: ${todo ? todo.length : 0})`);
    res.status(400).json({ error: 'Invalid todo input' });
  }
});

app.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});