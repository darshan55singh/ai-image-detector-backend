app.post("/detect", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        result: "No image uploaded",
        confidence: "N/A",
      });
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/openai/clip-vit-base-patch32",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/octet-stream",
        },
        body: req.file.buffer,
      }
    );

    const data = await response.json();

    if (!data || !data[0]) {
      return res.json({
        result: "Unable to analyze image",
        confidence: "N/A",
      });
    }

    // CLIP scores are similarity-based
    const score = Math.round(data[0].score * 100);

    res.json({
      result:
        score > 60
          ? "⚠️ Likely AI-generated image"
          : "✅ Likely real image",
      confidence: score + "%",
    });
  } catch (err) {
    console.error("AI error:", err);
    res.status(500).json({
      result: "Detection failed",
      confidence: "N/A",
    });
  }
});
