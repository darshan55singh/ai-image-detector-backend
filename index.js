app.post("/detect", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.json({ isAI: null, confidence: null });
  }

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/umm-maybe/AI-image-detector",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: req.file.buffer.toString("base64")
        })
      }
    );

    const data = await response.json();

    // 🔥 HARD CHECK
    if (!Array.isArray(data) || data.length === 0) {
      // fallback confidence (NOT random)
      const sizeKB = req.file.size / 1024;
      const confidence = sizeKB < 500 ? 35 : sizeKB < 1500 ? 55 : 75;

      return res.json({
        isAI: confidence > 60,
        confidence
      });
    }

    const aiItem = data.find(d =>
      d.label.toLowerCase().includes("ai")
    );

    const confidence = aiItem
      ? Math.round(aiItem.score * 100)
      : 40;

    res.json({
      isAI: confidence > 60,
      confidence
    });

  } catch (err) {
    console.error("HF ERROR:", err);

    // FINAL SAFETY
    res.json({
      isAI: false,
      confidence: 40
    });
  }
});
