const express = require('express');
const app = express();
const fs = require('fs');
const path = '/app/logs/pingpong-count.txt';

const incrementCounter = () => {
  let count = 0;
  if (fs.existsSync(path)) {
    count = parseInt(fs.readFileSync(path, 'utf8'));
  }
  count++;
  fs.writeFileSync(path, count.toString());
  return count;
}

app.get('/pingpong', (req, res) => {
  const count = incrementCounter();
  res.send(`pong ${count}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running in port ${PORT}`);
});