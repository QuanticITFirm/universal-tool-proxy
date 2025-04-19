export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) return res.status(400).send("Missing URL");

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/117.0 Safari/537.36"
      }
    });

    const html = await response.text();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).send(html);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch" });
  }
}
