const express = require('express');
const app = express();

let counter = 0; 

app.get('/pingpong', (req, res) => {
  res.send(`pong ${counter++}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running in port ${PORT}`);
});