const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fetch = require("node-fetch");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI Image Detector Backend (REAL AI) Running");
});

app.post("/detect", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      result: "No image uploaded",
      confidence: "N/A"
    });
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

    if (!Array.isArray(data)) {
      return res.status(500).json({
        result: "AI detection failed",
        confidence: "N/A"
      });
    }

    const aiScore =
      data.find(d => d.label.toLowerCase().includes("ai"))?.score || 0;

    const confidence = Math.round(aiScore * 100);

    res.json({
      result:
        confidence > 60
          ? "⚠️ Likely AI-generated image"
          : "✅ Likely human-made image",
      confidence: confidence
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      result: "Server error",
      confidence: "N/A"
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Backend running on port " + PORT);
});
