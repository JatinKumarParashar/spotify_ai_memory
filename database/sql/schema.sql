const mongoose = require('mongoose');

const interactionLogSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  fact: { type: String, required: true },
  prefType: { type: String, enum: ['PREFERS', 'EXCLUDES'], required: true },
  confidence: { type: Number, default: 1.0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InteractionLog', interactionLogSchema);