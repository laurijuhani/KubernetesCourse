import express from 'express';
import { initDb, pool } from './db';
import morgan from 'morgan';
import { connectNats, publishTodoEvent } from './nats';

const app = express();
const PORT = process.env.PORT;

initDb();
connectNats();

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

    const result = await client.query('UPDATE todos SET completed = $1 WHERE id = $2 RETURNING todo', [completed, id]);
    console.log(`Todo with ID ${id} marked as ${completed ? 'completed' : 'not completed'}`);
    res.status(204).end();
    client.release();
    const todo = {
      id,
      todo: result.rows[0].todo,
      completed
    };
    await publishTodoEvent('updated', { todo });
  } else {
    console.warn(`Invalid completion status for todo ID ${id}: ${completed}`);
    res.status(400).json({ error: 'Invalid completion status' });
  }
});

app.post('/', async (req, res) => {
  const todo = req.body.todo;
  if (typeof todo === 'string' && todo.length > 0 && todo.length <= 140) {
    const client = await pool.connect();
    const result = await client.query('INSERT INTO todos (todo) VALUES ($1) RETURNING id', [todo]);
    console.log(`New todo added: "${todo}"`);
    res.status(201).end();
    client.release();
    const todoId = result.rows[0].id;
    const todoObject = {
      id: todoId,
      todo,
      completed: false
    };
    await publishTodoEvent('created', { todo: todoObject });
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