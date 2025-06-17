const fs = require('fs');
const path = require('path');

const LOG_FILE = '/app/logs/output.log';

const generateRandomString = () => {
  return [...Array(32)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('');
}

const randomString = generateRandomString();

const logString = () => {
  const timestamp = new Date().toISOString();
  const line = `${timestamp}: ${randomString}\n`;
  fs.appendFileSync(LOG_FILE, line);
}

logString();
setInterval(logString, 5000);