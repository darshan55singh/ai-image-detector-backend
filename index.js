const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();

const upload = multer({
  storage: multer.diskStorage({
    destination: "/tmp",
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  }),
});

app.use(cors());
app.use(express.json());

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

    const imageBuffer = require("fs").readFileSync(req.file.path);

    const response = await fetch(
      "https://api-inference.huggingface.co/models/umm-maybe/AI-image-detector",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/octet-stream",
        },
        body: imageBuffer,
      }
    );

    const data = await response.json();

    if (!Array.isArray(data)) {
      return res.status(500).json({
        result: "AI model error",
        confidence: "N/A",
      });
    }

    const aiScore = data.find(d => d.label === "AI")?.score || 0;
    const confidence = Math.round(aiScore * 100) + "%";

    res.json({
      result:
        aiScore > 0.5
          ? "⚠️ Likely AI-generated image"
          : "✅ Likely real image",
      confidence,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      result: "Server error",
      confidence: "N/A",
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Backend running on port " + PORT);
});
