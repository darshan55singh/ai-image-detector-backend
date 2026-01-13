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

    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/umm-maybe/AI-image-detector",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
        },
        body: req.file.buffer,
      }
    );

    const data = await hfResponse.json();

    // 🧠 Handle model loading / errors
    if (data.error || data.estimated_time) {
      return res.json({
        result: "⏳ AI model warming up, try again",
        confidence: "N/A",
      });
    }

    if (!Array.isArray(data)) {
      throw new Error("Invalid AI response");
    }

    const score = Math.round(data[0].score * 100);

    res.json({
      result:
        score > 60
          ? "⚠️ Likely AI-generated image"
          : "✅ Likely real image",
      confidence: score + "%",
    });

  } catch (error) {
    console.error("AI Error:", error);
    res.json({
      result: "⚠️ AI service unavailable",
      confidence: "N/A",
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Backend running on port " + PORT);
});
