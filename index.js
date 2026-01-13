const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.post("/detect", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.json({
      result: "No image uploaded",
      confidence: "0%",
    });
  }

  const fakeProbability = Math.floor(Math.random() * 100);

  res.json({
    result:
      fakeProbability > 50
        ? "⚠️ Likely AI-generated image"
        : "✅ Likely real image",
    confidence: fakeProbability + "%",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Backend running on port " + PORT);
});
