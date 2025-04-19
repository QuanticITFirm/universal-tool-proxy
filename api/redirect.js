import followRedirects from 'follow-redirects';

export default function handler(req, res) {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).json({ error: "Missing URL parameter." });
  }

  const http = followRedirects.http;
  const https = followRedirects.https;

  const protocol = targetUrl.startsWith("https") ? https : http;

  const options = new URL(targetUrl);
  options.maxRedirects = 10;

  const redirects = [];
  const request = protocol.get({
    ...options,
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  }, (response) => {
    let data = "";

    if (response.responseUrl) {
      redirects.push(response.responseUrl);
    }

    response.on("data", chunk => data += chunk);
    response.on("end", () => {
      const finalURL = response.responseUrl || targetUrl;
      const canonicalMatch = data.match(/<link rel=["']canonical["'] href=["'](.*?)["']/i);
      const canonical = canonicalMatch ? canonicalMatch[1] : null;

      res.status(200).json({
        finalURL,
        canonical,
        redirects
      });
    });
  });

  request.on("error", (err) => {
    res.status(500).json({ error: "Failed to fetch or parse the page." });
  });
}