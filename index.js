import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/detect", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.json({ confidence: 0 });
  }

  try {
    const hfRes = await fetch(
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

    const data = await hfRes.json();

    // 🛡️ SAFETY
    if (!Array.isArray(data) || data.length === 0) {
      return res.json({ confidence: 50 });
    }

    // 🔥 CORRECT LOGIC
    let confidence = 50;

    const aiLabel = data.find(item =>
      item.label.toLowerCase().includes("ai") ||
      item.label.toLowerCase().includes("fake")
    );

    if (aiLabel) {
      confidence = Math.round(aiLabel.score * 100);
    } else {
      const realLabel = data.find(item =>
        item.label.toLowerCase().includes("real")
      );
      if (realLabel) {
        confidence = Math.round((1 - realLabel.score) * 100);
      }
    }

    res.json({ confidence });

  } catch (err) {
    console.error("HF ERROR:", err);
    res.json({ confidence: 45 });
  }
});

app.get("/", (req, res) => {
  res.send("Backend running ✅");
});

app.listen(PORT, () => {
  console.log("Server running on", PORT);
});
