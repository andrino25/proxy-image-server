const express = require('express');
const cors = require('cors');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
const nsfwjs = require('nsfwjs');  // Assuming you're running in Node.js compatible with this package
const { database } = require('./firebaseConfig');  // Adjust path to your Firebase config
const { ref, get, update } = require('firebase/database');
const nodeCron = require('node-cron');

const app = express();

// Enable CORS globally with custom headers
app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
});

app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/proxy-image', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('No URL provided');
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).send('Error fetching image: ' + response.statusText);
    }

    const imageArrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(imageArrayBuffer);
    res.set('Content-Type', response.headers.get('content-type'));
    res.send(imageBuffer);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).send('Error fetching image');
  }
});

// Load NSFW model
let model;
nsfwjs.load().then((loadedModel) => {
  model = loadedModel;
  console.log("NSFW model loaded");
});

// Function to analyze image
const analyzeImage = async (imageUrl) => {
  try {
    const img = new Image();
    img.src = `https://your-proxy-server.com/proxy-image?url=${encodeURIComponent(imageUrl)}`;
    img.crossOrigin = 'anonymous';

    return await model.classify(img);
  } catch (error) {
    console.error("Error analyzing image:", error);
    return null;
  }
};

// Function to scan pending posts
const scanPendingPosts = async () => {
  const postsRef = ref(database, 'posts');
  const snapshot = await get(postsRef);
  const posts = snapshot.val();

  if (posts) {
    for (const key in posts) {
      const post = posts[key];
      if (post.postStatus === 'Pending') {
        let isSafe = true;

        // Analyze each image
        for (const imageUrl of post.postImages) {
          const predictions = await analyzeImage(imageUrl);
          const isNSFW = predictions.some(
            prediction => ["Sexy", "Porn", "Hentai"].includes(prediction.className) && prediction.probability >= 0.7
          );

          if (isNSFW) {
            isSafe = false;
            break;
          }
        }

        const newStatus = isSafe ? 'Approved' : 'Rejected';
        const postRef = ref(database, `posts/${key}`);
        await update(postRef, { postStatus: newStatus });
        console.log(`Post ID: ${key} status updated to ${newStatus}`);
      }
    }
  }
};

// Run the scan every 5 minutes
nodeCron.schedule('*/5 * * * *', () => {
  console.log("Running scheduled scan for pending posts");
  scanPendingPosts();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
