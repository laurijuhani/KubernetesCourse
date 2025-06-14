const express = require('express');
const app = express();

const generateRandomString = () => {
  return [...Array(32)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('');
}

const randomString = generateRandomString();

const logString = () => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp}: ${randomString}`);
}

logString();
setInterval(logString, 5000);

app.get('/', (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    randomString: randomString
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running in port ${PORT}`);
});