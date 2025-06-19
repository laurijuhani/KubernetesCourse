const express = require('express');
const app = express();
const fs = require('fs');

const LOG_FILE = '/app/logs/output.log';
const message = process.env.MESSAGE;
const information = fs.readFileSync('/app/config/information.txt', 'utf8');

const PINGPONG_URL = 'http://ping-pong-svc:3000/pings'

const getData = (file, defaultValue = '') => {
  try {
    const data = fs.readFileSync(file, 'utf8');
    return data; 
  } catch (err) {
    return defaultValue;
  }
}; 

app.get('/', async (req, res) => {
  try {
    const logs = getData(LOG_FILE, 'No logs yet.');
    const count = await fetch(PINGPONG_URL);
    const countText = await count.json();
    res.type('text/plain').send(`
      file content: ${information}\n
      env variable: ${message}\n
      ${logs}\nPing / Pongs: ${countText.count}`
    );
  } catch (error) {
    res.status(500).send('Error reading log files');
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running in port ${PORT}`);
});