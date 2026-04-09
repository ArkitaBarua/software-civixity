const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// [TC_CVX_004] [TC_CVX_005] [TC_CVX_006] POST /api/detect-image with validations and size/type handling
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    // [TC_CVX_005] Missing or wrong form field results in 400
    return res.status(400).json({ error: 'No image uploaded' });
  }
  // Enforce simple MIME and size checks before invoking Python
  const allowed = ['image/jpeg', 'image/png'];
  if (!allowed.includes(req.file.mimetype || '')) {
    return res.status(415).json({ error: 'Unsupported media type' });
  }
  const maxBytes = 8 * 1024 * 1024; // 8 MB
  if ((req.file.size || 0) > maxBytes) {
    return res.status(413).json({ error: 'File too large' });
  }
  const imagePath = path.resolve(req.file.path);
  const pythonProcess = spawn('python', [path.resolve('trial.py'), imagePath]);

  let result = '';
  pythonProcess.stdout.on('data', (data) => {
    result += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error('Python stderr:', data.toString());
  });

  pythonProcess.on('close', (code) => {
    // Clean up uploaded file
    fs.unlink(imagePath, () => {});
    console.log('AI detection result:', result.trim(), 'Exit code:', code);
    if (code !== 0) {
      return res.status(500).json({ error: 'AI detection failed', details: result.trim() });
    }
    // Return result (trim whitespace)
    if (result.trim() === 'AI' || result.trim() === 'Natural') {
      // [TC_CVX_004] Success payload
      res.json({ result: result.trim() });
    } else {
      res.status(500).json({ error: 'Unexpected AI detection output', details: result.trim() });
    }
  });
});

module.exports = router; 