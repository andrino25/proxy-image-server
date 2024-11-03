const express = require('express');
const cors = require('cors');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(cors());

app.get('/test', (req, res) => {
  res.send('Server is working!');
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

    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Content-Type', response.headers.get('content-type'));

    res.send(imageBuffer);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).send('Error fetching image');
  }
});


// Do not call app.listen() on Vercel
module.exports = app;
