// API endpoint to retrieve persisted logs from Vercel KV for our premium logs dashboard
export default async function handler(req, res) {
  // Support CORS for easy local development and cross-origin analytics testing
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return res.status(200).json({
      success: false,
      setupRequired: true,
      error: 'Vercel KV environment variables (KV_REST_API_URL / KV_REST_API_TOKEN) are missing. Please link a free KV Database in your Vercel Project under the "Storage" tab!'
    });
  }

  // Security Credentials Verification
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
  const providedPassword = req.query.secret || (req.body && req.body.password) || req.headers['authorization']?.replace('Bearer ', '');

  if (providedPassword !== adminPassword) {
    return res.status(401).json({
      success: false,
      error: 'Access Denied: Invalid Administrative Password.'
    });
  }

  try {
    // Read all records from the Redis list `fun_logs` (0 to -1 means all)
    const response = await fetch(`${url}/lrange/fun_logs/0/-1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Redis error: ${await response.text()}`);
    }

    const data = await response.json();
    const rawLogs = data.result || [];
    
    // Parse list string entries back into JSON objects
    const logs = rawLogs.map(logStr => {
      try {
        return JSON.parse(logStr);
      } catch (e) {
        return {
          timestamp: new Date().toISOString(),
          type: 'error',
          message: 'Failed to parse log entry',
          raw: logStr
        };
      }
    });

    return res.status(200).json({
      success: true,
      logs,
      isDemo: !process.env.ADMIN_PASSWORD, // True if using default fallback password 'admin'
      dbSize: rawLogs.length
    });
  } catch (error) {
    console.error('❌ Failed to retrieve logs from Vercel KV:', error);
    return res.status(500).json({
      success: false,
      error: `Failed to fetch logs: ${error.message}`
    });
  }
}
