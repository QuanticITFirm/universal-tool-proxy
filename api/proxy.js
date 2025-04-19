import { https } from 'follow-redirects';

export default async function handler(req, res) {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send("Missing URL");

  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    },
    maxRedirects: 10
  };

  const urlObj = new URL(targetUrl);
  const reqStream = https.request(urlObj, options, streamRes => {
    let rawData = '';
    streamRes.on('data', chunk => rawData += chunk);
    streamRes.on('end', () => {
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('X-Final-URL', streamRes.responseUrl || targetUrl);
      res.status(200).send(rawData);
    });
  });

  reqStream.on('error', err => {
    console.error("Fetch error:", err.message);
    res.status(500).send("Proxy request failed");
  });

  reqStream.end();
}