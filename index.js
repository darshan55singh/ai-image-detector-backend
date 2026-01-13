const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();   // ← THIS LINE MUST EXIST
const upload = multer();

app.use(cors());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.post("/detect", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({
        result: "No image uploaded",
        confidence: "N/A"
      });
    }

    // TEMP DUMMY RESPONSE (to confirm deploy)
    res.json({
      result: "Image checked",
      confidence: "75%"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      result: "AI service unavailable",
      confidence: "N/A"
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
