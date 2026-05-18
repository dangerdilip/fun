// Shared helper to persist game logs to Vercel KV (Redis) using the fast REST API
export async function saveLog(logData) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    // Soft warning to not crash the serverless function if KV is not set up yet
    console.warn('⚠️ Vercel KV environment variables (KV_REST_API_URL / KV_REST_API_TOKEN) are missing. Log not persisted.');
    return false;
  }

  try {
    // We send an atomic Redis multi-exec transaction to push the log and trim the list to 10,000 items
    // This keeps database storage size free and extremely optimized!
    const response = await fetch(`${url}/multi-exec`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([
        ['LPUSH', 'fun_logs', JSON.stringify(logData)],
        ['LTRIM', 'fun_logs', 0, 9999] // Retain last 10,000 log records (perfect for 30+ days of active traffic!)
      ])
    });

    if (!response.ok) {
      console.error('❌ Failed to save log to Vercel KV:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Error saving log to Vercel KV:', error);
    return false;
  }
}
