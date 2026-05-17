export default function handler(req, res) {
  // Support both GET query parameters and POST request bodies for ultimate compatibility
  const event = req.query.event || (req.body && req.body.event) || 'Unknown';
  
  let data = {};
  try {
    if (req.query.data) {
      data = JSON.parse(decodeURIComponent(req.query.data));
    } else if (req.body && req.body.data) {
      data = req.body.data;
    }
  } catch (e) {
    data = { raw: req.query.data || req.body.data };
  }

  // Intercept the player's high-accuracy geolocation headers
  const country = req.headers['x-vercel-ip-country'] || 'Unknown';
  const region = req.headers['x-vercel-ip-country-region'] || 'Unknown';
  
  let city = req.headers['x-vercel-ip-city'] || 'Unknown';
  try {
    city = decodeURIComponent(city);
  } catch (e) {}

  // Print a clear, premium log inside the Vercel Logs tab
  console.log(`🎮 [GAME EVENT] Event: ${event.toUpperCase()} | Info: ${JSON.stringify(data)} | Player Location: ${city}, ${region}, ${country}`);

  // Return a success response
  res.status(200).json({ success: true });
}
