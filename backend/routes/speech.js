const express = require('express');
const router = express.Router();

// Base URL of the Python speech service
const SPEECH_BASE_URL = process.env.SPEECH_BASE_URL || 'http://localhost:5001';

// Health proxy (optional)
router.get('/health', async (req, res) => {
  try {
    const r = await fetch(`${SPEECH_BASE_URL}/api/speech/health`);
    const body = await r.json().catch(() => ({}));
    res.status(r.status).json(body);
  } catch (e) {
    res.status(502).json({ error: 'Speech service unreachable', details: e.message });
  }
});

// Process (STT/language detect)
router.post('/process', async (req, res) => {
  try {
    const r = await fetch(`${SPEECH_BASE_URL}/api/speech/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const body = await r.json().catch(() => ({}));
    res.status(r.status).json(body);
  } catch (e) {
    res.status(502).json({ error: 'Speech service unreachable', details: e.message });
  }
});

// Output (TTS/translate)
router.post('/output', async (req, res) => {
  try {
    const r = await fetch(`${SPEECH_BASE_URL}/api/speech/output`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const body = await r.json().catch(() => ({}));
    res.status(r.status).json(body);
  } catch (e) {
    res.status(502).json({ error: 'Speech service unreachable', details: e.message });
  }
});

module.exports = router;


