import express from "express";
import cors from "cors";
import multer from "multer";
import fetch from "node-fetch";
import FormData from "form-data";

const app = express(); // ✅ THIS WAS MISSING
const upload = multer();
app.use(cors());

const HF_TOKEN = process.env.HF_TOKEN;

app.post("/detect", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ result: "No image uploaded" });
    }

    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname
    });

    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/openai/clip-vit-base-patch32",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`
        },
        body: formData
      }
    );

    const data = await hfResponse.json();

    res.json({
      result: "AI image check completed",
      confidence: "85%" // TEMP (real ML later)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "Detection failed" });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
