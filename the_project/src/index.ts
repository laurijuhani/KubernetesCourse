import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

const CACHE_DIR = '/app/cache';
const IMAGE_FILE = path.join(CACHE_DIR, 'image.jpg');
const META_FILE = path.join(CACHE_DIR, 'meta.json');
const CACHE_DURATION = 10 * 60 * 1000;

interface MetaData {
  lastFetched: number;
}

const fetchAndCacheImage = async () => {
  const res = await fetch('https://picsum.photos/1200');
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);  
  fs.writeFileSync(IMAGE_FILE, buffer); 
  const metaData: MetaData = { lastFetched: Date.now() };
  fs.writeFileSync(META_FILE, JSON.stringify(metaData));
};

const shouldFetchNewImage = () => {
  if (!fs.existsSync(IMAGE_FILE) || !fs.existsSync(META_FILE)) {
    return true;
  }
  const metaData: MetaData = JSON.parse(fs.readFileSync(META_FILE, 'utf-8'));
  const currentTime = Date.now();
  return (currentTime - metaData.lastFetched) > CACHE_DURATION;
}


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
  res.sendFile(path.join(__dirname, '../html/index.html'));
});


app.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});