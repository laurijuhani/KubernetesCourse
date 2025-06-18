const express = require('express');
const app = express();

let count = 0; 


app.get('/pingpong', (req, res) => {
  res.send(`pong ${count++}`);
});

app.get('/pings', (req, res) => {
  res.json({ count }); 
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running in port ${PORT}`);
});