app.post("/detect", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        result: "No image uploaded",
        confidence: "N/A"
      });
    }

    // TEMP RANDOM LOGIC (until real AI is stable)
    const fakeProbability = Math.floor(Math.random() * 100);

    const result =
      fakeProbability > 50
        ? "⚠️ Likely AI-generated image"
        : "✅ Likely real image";

    res.json({
      result,
      confidence: fakeProbability + "%"
    });

  } catch (error) {
    console.error("Detection error:", error);
    res.status(500).json({
      result: "AI service unavailable",
      confidence: "N/A"
    });
  }
});
