const express = require('express');
const cors = require('cors');

// Import node-fetch dynamically because it is now an ES module
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = 3000;

app.use(cors()); // Enable CORS for all routes

app.get('/proxy-image', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('No URL provided');
  }

  try {
    // Fetch the image from the provided URL
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).send('Error fetching image: ' + response.statusText);
    }

    const imageBuffer = await response.buffer();
    res.set('Content-Type', response.headers.get('content-type'));
    res.send(imageBuffer);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).send('Error fetching image');
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});
