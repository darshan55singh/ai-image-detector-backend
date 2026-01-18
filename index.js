const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI Image Detector Backend Running");
});

app.post("/detect", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      result: "No image uploaded",
      confidence: "N/A"
    });
  }

  // Demo AI-like logic (metadata based)
  const sizeMB = req.file.size / (1024 * 1024);
  let confidence;

  if (sizeMB < 0.5) confidence = 82;
  else if (sizeMB < 1.5) confidence = 58;
  else confidence = 34;

  const isAI = confidence > 60;

  res.json({
    result: isAI
      ? "⚠️ Likely AI-generated image"
      : "✅ Likely real image",
    confidence: confidence + "%"
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Backend running on port " + PORT);
});
