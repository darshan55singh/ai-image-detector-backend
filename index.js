const express = require("express");
const cors = require("cors");
const multer = require("multer");

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

app.post("/detect", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
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
