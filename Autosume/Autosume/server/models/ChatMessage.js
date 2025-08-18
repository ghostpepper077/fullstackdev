// models/ChatMessage.js
const mongoose = require("mongoose");

const ChatMessageSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
  },
  role: {
    type: String, // 'user' or 'bot'
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ChatMessage", ChatMessageSchema);
