const express = require('express');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT;
const app = express();

const CACHE_DIR = process.env.CACHE_DIR; 
const IMAGE_FILE = path.join(CACHE_DIR, 'image.jpg');
const META_FILE = path.join(CACHE_DIR, 'meta.json');
const CACHE_DURATION = 10 * 60 * 1000; 

const fetchAndCacheImage = async () => {
  const res = await fetch('https://picsum.photos/1200');
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(IMAGE_FILE, buffer);
  const metaData = { lastFetched: Date.now() };
  fs.writeFileSync(META_FILE, JSON.stringify(metaData));
}; 

const shouldFetchNewImage = () => {
  if (!fs.existsSync(IMAGE_FILE) || !fs.existsSync(META_FILE)) {
    return true;
  }
  const metaData = JSON.parse(fs.readFileSync(META_FILE, 'utf8'));
  return (Date.now() - metaData.lastFetched) > CACHE_DURATION;
}; 

app.get('/image', async (_req, res) => {
  try {
    if (shouldFetchNewImage()) {
      await fetchAndCacheImage();
    } 
    res.sendFile(IMAGE_FILE);
  } catch (err) {
    res.status(500).send('Failed to fetch or serve image');
  }
});


app.get('/', (_req, res) => {
  let html = fs.readFileSync(path.join(__dirname, 'html', 'index.html'), 'utf8');
  html = html.replace('%%BACKEND_URL%%', process.env.BACKEND_URL);
  res.send(html);
});


app.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});
