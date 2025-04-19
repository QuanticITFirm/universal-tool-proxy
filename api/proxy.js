export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end(); // Preflight
    return;
  }

  const targetUrl = req.query.url;

  if (!targetUrl) {
    res.status(400).json({ error: 'Missing url parameter' });
    return;
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0 Safari/537.36',
      },
    });
    const html = await response.text();
    res.status(200).send(html);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch target URL' });
  }
}
