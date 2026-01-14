const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fetch = require("node-fetch");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI Image Detector Backend Running");
});

app.post("/detect", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      label: "No image uploaded",
      confidence: "0%",
    });
  }

  try {
    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/umm-maybe/AI-image-detector",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
        },
        body: req.file.buffer,
      }
    );

    const result = await hfResponse.json();

    if (!Array.isArray(result)) {
      return res.status(500).json({
        label: "AI service error",
        confidence: "N/A",
      });
    }

    const aiScore = result.find(r => r.label === "AI-generated");
    const realScore = result.find(r => r.label === "Real");

    const final =
      aiScore.score > realScore.score
        ? { label: "⚠️ Likely AI-generated image", confidence: Math.round(aiScore.score * 100) + "%" }
        : { label: "✅ Likely real image", confidence: Math.round(realScore.score * 100) + "%" };

    res.json(final);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      label: "Backend error",
      confidence: "N/A",
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
