export default function handler(req, res) {
  // Extract high-accuracy geolocation headers injected by Vercel's Edge Network
  const country = req.headers['x-vercel-ip-country'] || 'Unknown';
  const region = req.headers['x-vercel-ip-country-region'] || 'Unknown';
  
  // City name might be URL-encoded, so we decode it safely
  let city = req.headers['x-vercel-ip-city'] || 'Unknown';
  try {
    city = decodeURIComponent(city);
  } catch (e) {}

  // Print a clear, formatted log that will show up instantly in your Vercel Dashboard "Logs" tab!
  console.log(`🌍 [VISITOR LOG] Country: ${country} | Region/State: ${region} | City/District: ${city}`);

  // Return the data as JSON in case you want to use it on the frontend later
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
  res.status(200).json({
    country,
    region,
    city
  });
}
