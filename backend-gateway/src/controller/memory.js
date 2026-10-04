const { EventSchema } = require("../schemas/events");
const axios = require("axios");

const PYTHON_BASE = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";

exports.getMemory = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId)
      return res
        .status(400)
        .json({ error: "Query param 'userId' is required" });

    const response = await axios.get(`${PYTHON_BASE}/internal/memories`, {
      params: { user_id: userId },
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch memories from AI service" });
  }
};

exports.postMemory = async (req, res) => {
    console.log("backend of node js is working ")
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
};

exports.patchMemory = async (req, res) => {
    try {
        const response = await axios.patch(
          `${PYTHON_BASE}/internal/memories/${req.params.id}`,
          req.body
        );
        res.json(response.data);
      } catch (err) {
        res.status(500).json({ error: "Failed to supersede memory" });
      }
};

exports.deleteMemory = async (req, res) => {
     try {
    const response = await axios.delete(
      `${PYTHON_BASE}/internal/memories/${req.params.id}`
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete memory record" });
  }
}
