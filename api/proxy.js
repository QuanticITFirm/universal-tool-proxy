import { https } from 'follow-redirects';
import { createGunzip } from 'zlib';

export default function handler(req, res) {
  const { url } = req.query;

  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  https.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Encoding': 'gzip,deflate'
    }
  }, response => {
    let stream = response;

    // Decompress if needed
    const encoding = response.headers['content-encoding'];
    if (encoding === 'gzip') {
      stream = response.pipe(createGunzip());
    }

    let data = '';
    stream.on('data', chunk => data += chunk);
    stream.on('end', () => {
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
      res.status(200).send(data);
    });
  }).on('error', err => {
    res.status(500).json({ error: 'Failed to fetch page', detail: err.message });
  });
}