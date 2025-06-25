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
  ssl: false
});

const initDb = async (retries=3, delay=3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      await client.query(`
        CREATE TABLE IF NOT EXISTS todos (
          id SERIAL PRIMARY KEY,
          todo TEXT NOT NULL CHECK (LENGTH(todo) > 0 AND LENGTH(todo) <= 140),
          completed BOOLEAN NOT NULL DEFAULT FALSE
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
  const result = await client.query('SELECT * FROM todos');
  res.json(result.rows);
  client.release();
});


app.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const completed = req.body.completed;
  if (typeof completed === 'boolean') {
    const client = await pool.connect();
    await client.query('UPDATE todos SET completed = $1 WHERE id = $2', [completed, id]);
    console.log(`Todo with ID ${id} marked as ${completed ? 'completed' : 'not completed'}`);
    res.status(204).end();
    client.release();
  } else {
    console.warn(`Invalid completion status for todo ID ${id}: ${completed}`);
    res.status(400).json({ error: 'Invalid completion status' });
  }
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

app.get('/healthz', async (_req, res) => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    res.status(200).send('OK');
  } catch (err) {
    res.status(500).send('DB not reachable');
  }
});

app.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});