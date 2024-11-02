const express = require('express');
const cors = require('cors');

// Import node-fetch dynamically because it is now an ES module
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000; // Use environment port or default to 3000

app.use(cors()); // Enable CORS for all routes

app.get('/proxy-image', async (req, res) => {
  const { url } = req.query;

  // Check if the URL is provided
  if (!url) {
    return res.status(400).send('No URL provided');
  }

  try {
    // Fetch the image from the provided URL
    const response = await fetch(url);

    // Check if the response is OK
    if (!response.ok) {
      return res.status(response.status).send('Error fetching image: ' + response.statusText);
    }

    // Get the image buffer and set appropriate headers
    const imageBuffer = await response.buffer();
    const contentType = response.headers.get('content-type');

    // Ensure the response is of image type
    if (!contentType.startsWith('image/')) {
      return res.status(400).send('URL does not point to an image');
    }

    res.set('Content-Type', contentType); // Set content type to the response
    res.send(imageBuffer); // Send the image buffer as the response
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).send('Error fetching image');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});
