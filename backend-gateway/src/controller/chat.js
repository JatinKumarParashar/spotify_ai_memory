const {ChatSchema} = require('../schemas/events');
const axios = require('axios');

const PYTHON_BASE = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

exports.chat = async (req, res) => { 
    const result = ChatSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ errors: result.error.errors });

  try {
    console.log("backend of node js is working ")
    const response = await axios.post(`${PYTHON_BASE}/internal/chat`, {
      user_id: result.data.userId,
      prompt: result.data.prompt
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Failed to process AI chat query" });
  }
}
