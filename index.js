const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Read token from environment (Render)
const HF_TOKEN = process.env.HF_TOKEN;

app.use(cors());
app.use(express.json());

// ✅ Health check (important for Render)
app.get("/", (req, res) => {
  res.send("AI Image Detector Backend is running 🚀");
});

// ✅ Image detection endpoint
app.post("/detect", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ result: "No image uploaded" });
  }

  // 🔴 TEMP LOGIC (safe demo – no Hugging Face yet)
  // We will replace this with real AI in next step
  const fakeProbability = Math.floor(Math.random() * 100);

  const result =
    fakeProbability > 50
      ? "⚠️ Likely AI-generated image"
      : "✅ Likely real image";

  res.json({
    result,
    confidence: fakeProbability + "%",
  });
});

// ✅ Use Render's PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
