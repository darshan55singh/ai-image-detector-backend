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
  if (!req.file) {
    return res.json({
      result: "No image uploaded",
      confidence: "N/A",
    });
  }

  // TEMP DEMO LOGIC
  const score = Math.floor(Math.random() * 100);

  res.json({
    result:
      score > 60
        ? "⚠️ Likely AI-generated image"
        : "✅ Likely real image",
    confidence: score + "%",
  });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Backend running on port " + PORT);
});

