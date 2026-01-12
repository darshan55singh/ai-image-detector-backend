const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

app.post("/detect", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.json({ result: "No image uploaded" });
  }

  // TEMP LOGIC (AI will be added later)
  const fakeProbability = Math.floor(Math.random() * 100);

  let result =
    fakeProbability > 50
      ? "⚠️ Likely AI-generated image"
      : "✅ Likely real image";

  res.json({
    result,
    confidence: fakeProbability + "%",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Backend running on port " + PORT);
});
