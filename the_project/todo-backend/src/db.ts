import { Pool } from 'pg';

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

export { pool, initDb };