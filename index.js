const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express(); // ✅ THIS LINE WAS MISSING
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

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

    if (!Array.isArray(data) || !data[0]) {
      return res.json({
        result: "Unable to analyze image",
        confidence: "N/A",
      });
    }

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Backend running on port " + PORT);
});
