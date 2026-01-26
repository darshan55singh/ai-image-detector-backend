const express = require('express');
const multer = require('multer');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow cross-origin requests from frontend
app.use(express.json()); // Parse JSON bodies

// Multer setup for image uploads (temporary storage)
const upload = multer({
  dest: 'uploads/', // Temp directory for uploaded files
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// In-memory storage for user usage (MVP: resets on server restart)
let userUsage = {}; // { email: { count: number, lastReset: timestamp } }

// Helper: Check and update usage
function checkUsage(email, isLoggedIn) {
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

  if (!isLoggedIn) return { allowed: true, message: '' }; // No limit for non-logged in (handled on frontend)

  if (!userUsage[email]) {
    userUsage[email] = { count: 0, lastReset: now };
  }

  // Reset if a week has passed
  if (now - userUsage[email].lastReset >= weekMs) {
    userUsage[email] = { count: 0, lastReset: now };
  }

  if (userUsage[email].count >= 3) {
    return { allowed: false, message: 'Weekly limit of 3 analyses exceeded. Try again next week.' };
  }

  return { allowed: true, message: '' };
}

function updateUsage(email) {
  if (userUsage[email]) {
    userUsage[email].count += 1;
  }
}

// API Endpoint: POST /detect
app.post('/detect', upload.single('image'), async (req, res) => {
  try {
    const { email, isLoggedIn } = req.body; // Email from frontend (optional for logged-in users)
    const isLoggedInBool = isLoggedIn === 'true';

    // Validate input
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded.' });
    }

    // Check usage limits
    const usageCheck = checkUsage(email || 'anonymous', isLoggedInBool);
    if (!usageCheck.allowed) {
      return res.status(429).json({ error: usageCheck.message });
    }

    // Read the uploaded image
    const imagePath = path.join(__dirname, req.file.path);
    const imageBuffer = fs.readFileSync(imagePath);

    // Hugging Face API call (using ResNet-50 for image classification; adapt for AI detection)
    const HF_API_URL = 'https://api-inference.huggingface.co/models/microsoft/resnet-50';
    const HF_TOKEN = process.env.HF_API_KEY; // Set in Render env vars

    const response = await axios.post(HF_API_URL, imageBuffer, {
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/octet-stream'
      }
    });

    // Clean up temp file
    fs.unlinkSync(imagePath);

    // Process response: Assume the model returns [{ label: 'AI-generated', score: 0.85 }, ...]
    // For simplicity, take the highest score for 'AI-generated' or similar label (adjust based on model)
    const predictions = response.data;
    const aiPrediction = predictions.find(p => p.label.toLowerCase().includes('ai') || p.label.toLowerCase().includes('generated')) || predictions[0];
    const confidence = Math.round(aiPrediction.score * 100); // Convert to 0-100

    // Update usage for logged-in users
    if (isLoggedInBool && email) {
      updateUsage(email);
    }

    res.json({ confidence });
  } catch (error) {
    console.error('Error in /detect:', error.message);
    // Clean up temp file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to analyze image. Please try again.' });
  }
});

// Health check
app.get('/', (req, res) => res.send('SatyaLens Backend is running!'));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});