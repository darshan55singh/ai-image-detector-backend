import express from "express";
import cors from "cors";
import multer from "multer";
import fetch from "node-fetch";
import fs from "fs";

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.diskStorage({
    destination: "/tmp",
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  }),
});

app.get("/", (req, res) => {
  res.send("AI Image Detector Backend Running");
});

app.post("/detect", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        result: "No image uploaded",
        confidence: "N/A",
      });
    }

    const imageBuffer = fs.readFileSync(req.file.path);

    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/Organika/sdxl-detector",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/octet-stream",
        },
        body: imageBuffer,
      }
    );

    const text = await hfResponse.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("HF RAW RESPONSE:", text);
      return res.status(500).json({
        result: "AI model busy / unavailable",
        confidence: "N/A",
      });
    }

    const aiScore =
      data?.[0]?.label === "AI"
        ? data[0].score
        : data?.[1]?.score || 0;

    res.json({
      result:
        aiScore > 0.5
          ? "⚠️ Likely AI-generated image"
          : "✅ Likely real image",
      confidence: Math.round(aiScore * 100) + "%",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      result: "Server error",
      confidence: "N/A",
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});
