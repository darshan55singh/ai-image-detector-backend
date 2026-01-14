import express from "express";
import fetch from "node-fetch";
import multer from "multer";
import cors from "cors";

const app = express();
const upload = multer();
app.use(cors());

app.post("/detect", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/Organika/sdxl-detector",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/octet-stream",
        },
        body: req.file.buffer, // 🔥 MOST IMPORTANT
      }
    );

    const text = await response.text();

    // Debug safety
    if (!text.startsWith("{") && !text.startsWith("[")) {
      console.error("HF RAW RESPONSE:", text);
      return res.status(500).json({ error: "Invalid response from AI model" });
    }

    const result = JSON.parse(text);
    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(10000, () => {
  console.log("Backend running on port 10000");
});
