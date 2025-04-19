export default async function handler(req, res) {
  const { url } = req.query;

  if (!url || !url.startsWith("http")) {
    return res.status(400).json({ error: "Invalid or missing URL" });
  }

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return res.status(200).json(data);
    } else {
      const text = await response.text();
      return res.status(200).send(text);
    }
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch the URL" });
  }
}
