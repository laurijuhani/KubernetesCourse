const express = require('express');
const app = express();
const fs = require('fs');

const LOG_FILE = '/app/logs/output.log';
const COUNT_FILE = '/app/logs/pingpong-count.txt';

const getData = (file, defaultValue = '') => {
  try {
    const data = fs.readFileSync(file, 'utf8');
    return data; 
  } catch (err) {
    return defaultValue;
  }
}; 

app.get('/', (req, res) => {
  try {
    const logs = getData(LOG_FILE, 'No logs yet.');
    const count = getData(COUNT_FILE, '0');
    res.type('text/plain').send(`${logs}\nPing / Pongs: ${count}`);
  } catch (error) {
    res.status(500).send('Error reading log files');
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running in port ${PORT}`);
});