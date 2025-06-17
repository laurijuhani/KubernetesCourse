const express = require('express');
const app = express();
const fs = require('fs');

const LOG_FILE = '/app/logs/output.log';

app.get('/', (req, res) => {
  fs.readFile(LOG_FILE, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Log file not found or unreadable.');
    }
    res.type('text/plain').send(data);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running in port ${PORT}`);
});