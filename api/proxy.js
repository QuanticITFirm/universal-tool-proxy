import { http, https } from 'follow-redirects';

export default async function handler(req, res) {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing URL' });
  }

  const client = targetUrl.startsWith('https') ? https : http;

  const visitedUrls = [];
  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
      Accept: '*/*',
    },
    maxRedirects: 10,
  };

  client.get(targetUrl, options, (response) => {
    response.setEncoding('utf8');
    let body = '';

    // Track redirects
    if (response.responseUrl) {
      visitedUrls.push(response.responseUrl);
    }

    response.on('data', (chunk) => {
      body += chunk;
    });

    response.on('end', () => {
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate'); // Vercel cache
      res.setHeader('X-Redirect-Hops', visitedUrls.join(' → '));
      res.status(200).send(body);
    });
  }).on('error', (err) => {
    console.error(err);
    res.status(500).json({ error: 'Proxy request failed', details: err.message });
  });
}