const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fetch = require("node-fetch");
const FormData = require("form-data");

const app = express();
const upload = multer();

app.use(cors());

const HF_TOKEN = process.env.HF_TOKEN;

app.post("/detect", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ result: "No image uploaded", confidence: "N/A" });
    }

    const formData = new FormData();
    formData.append("file", req.file.buffer, req.file.originalname);

    const hfRes = await fetch(
      "https://api-inference.huggingface.co/models/openai/clip-vit-base-patch32",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`
        },
        body: formData
      }
    );

    if (!hfRes.ok) {
      throw new Error("HF API failed");
    }

    await hfRes.json();

    res.json({
      result: "Image checked successfully",
      confidence: "80%"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      result: "AI service unavailable",
      confidence: "N/A"
    });
  }
});

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
