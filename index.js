app.post("/detect", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        result: "No image uploaded",
        confidence: "N/A",
      });
    }

    const fs = await import("fs");
    const imageBuffer = fs.readFileSync(req.file.path);

    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/Organika/sdxl-detector",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/octet-stream",
        },
        body: imageBuffer,
      }
    );

    const text = await hfResponse.text(); // IMPORTANT

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("HF RAW RESPONSE:", text);
      return res.status(500).json({
        result: "AI model unavailable",
        confidence: "N/A",
      });
    }

    const aiScore =
      data?.[0]?.label === "AI"
        ? data[0].score
        : data?.[1]?.score || 0;

    const confidence = Math.round(aiScore * 100) + "%";

    res.json({
      result:
        aiScore > 0.5
          ? "⚠️ Likely AI-generated image"
          : "✅ Likely real image",
      confidence,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      result: "Server error",
      confidence: "N/A",
    });
  }
});
