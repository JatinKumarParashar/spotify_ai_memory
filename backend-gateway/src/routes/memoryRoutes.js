const express = require('express');
const axios = require('axios');
const { EventSchema } = require('../schemas/events');

const router = express.Router();
const PYTHON_BASE = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

router.get('/memories', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "Query param 'userId' is required" });

    const response = await axios.get(`${PYTHON_BASE}/internal/memories`, {
      params: { user_id: userId }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch memories from AI service" });
  }
});

router.post('/events', async (req, res) => {
  const result = EventSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ errors: result.error.errors });

  try {
    const response = await axios.post(`${PYTHON_BASE}/internal/events`, {
      user_id: result.data.userId,
      fact: result.data.fact,
      pref_type: result.data.prefType,
      confidence: result.data.confidence || 1.0
    });
    res.status(201).json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Failed to ingest event into AI database" });
  }
});

router.patch('/memories/:id', async (req, res) => {
  try {
    const response = await axios.patch(
      `${PYTHON_BASE}/internal/memories/${req.params.id}`,
      req.body
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Failed to supersede memory" });
  }
});

router.delete('/memories/:id', async (req, res) => {
  try {
    const response = await axios.delete(
      `${PYTHON_BASE}/internal/memories/${req.params.id}`
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete memory record" });
  }
});

module.exports = router;