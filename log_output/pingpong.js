const express = require('express');
const app = express();
const { Pool } = require('pg');

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
  port: PGPORT,
});

const initDb = async (retries=3, delay=3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      await client.query(`
        CREATE TABLE IF NOT EXISTS counter (
          id SERIAL PRIMARY KEY,
          count INTEGER NOT NULL
        );
      `);
      const res = await client.query('SELECT count FROM counter WHERE id = 1');
      if (res.rows.length === 0) {
        await client.query('INSERT INTO counter (count) VALUES (0)');
      }
      client.release();
      console.log('Database initialized!');
      return;
    } catch (err) {
      console.error(`Database not ready, retrying in ${delay / 1000}s...`, err.message);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error('Failed to initialize database after multiple attempts');
};

initDb(); 


app.get('/pingpong', async (req, res) => {
  const client = await pool.connect();
  const result = await client.query('SELECT count FROM counter WHERE id = 1');
  res.send(`pong ${result.rows[0].count}`);
  await client.query('UPDATE counter SET count = count + 1 WHERE id = 1');
  client.release();
});

app.get('/pings', async (req, res) => {
  const client = await pool.connect();
  const result = await client.query('SELECT count FROM counter WHERE id = 1');
  res.json({ count: result.rows[0].count }); 
  client.release();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running in port ${PORT}`);
});