const { z } = require('zod');

const EventSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  fact: z.string().min(1, "Preference text is required"),
  prefType: z.enum(['PREFERS', 'EXCLUDES']),
  confidence: z.number().min(0).max(1).optional()
});

const ChatSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  prompt: z.string().min(1, "Prompt cannot be empty")
});

module.exports = { EventSchema, ChatSchema };