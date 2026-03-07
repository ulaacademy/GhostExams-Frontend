export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { url } = req.body;

    const key = "64d54f6dfc9a4d1294f45a64fb88e37d";
    const host = "ghostexams.com";

    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        host: host,
        key: key,
        keyLocation: `https://${host}/${key}.txt`,
        urlList: [url],
      }),
    });

    const text = await response.text();

    res.status(200).json({
      success: true,
      response: text,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}