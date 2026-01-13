const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express(); // ✅ THIS WAS MISSING / MISPLACED
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI Image Detector Backend is running 🚀");
});

app.post("/detect", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        result: "No image uploaded",
        confidence: "N/A"
      });
    }

    // TEMP LOGIC (random confidence)
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

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Backend running on port " + PORT);
});
