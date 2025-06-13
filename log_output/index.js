
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