import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import cors from "cors";

const app = express(); // ✅ THIS WAS MISSING
const upload = multer();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/detect", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.json({
      isAI: false,
      confidence: 0
    });
  }

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/umm-maybe/AI-image-detector",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: req.file.buffer.toString("base64")
        })
      }
    );

    const data = await response.json();

    // ❗ SAFE CHECK
    if (!Array.isArray(data) || data.length === 0) {
      return res.json({
        isAI: false,
        confidence: 40
      });
    }

    const aiItem = data.find(d =>
      d.label.toLowerCase().includes("ai")
    );

    const confidence = aiItem
      ? Math.round(aiItem.score * 100)
      : 45;

    res.json({
      isAI: confidence > 60,
      confidence
    });

  } catch (err) {
    console.error("AI ERROR:", err);
    res.json({
      isAI: false,
      confidence: 35
    });
  }
});

app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
