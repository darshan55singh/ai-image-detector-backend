const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fetch = require("node-fetch");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

app.post("/detect", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({
        result: "No image uploaded",
        confidence: "N/A",
      });
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/umm-maybe/AI-image-detector",
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

    if (!Array.isArray(data)) {
      throw new Error("Invalid AI response");
    }

    const aiScore = Math.round(data[0].score * 100);

    res.json({
      result:
        aiScore > 60
          ? "⚠️ Likely AI-generated image"
          : "✅ Likely real image",
      confidence: aiScore + "%",
    });
  } catch (err) {
    console.error(err);
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
