import express from 'express';


const app = express();
const PORT = process.env.PORT || 3000;



app.use(express.json());

const todos: string[] = [];


app.get('/todos', async (_req, res) => {
  res.json(todos);
});

app.post('/todos', async (req, res) => {
  const todo = req.body.todo;
  if (typeof todo === 'string' && todo.length > 0 && todo.length <= 140) {
    todos.push(todo);
    res.status(201).end();
  } else {
    res.status(400).json({ error: 'Invalid todo input' });
  }
});

app.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});