// routes/chatbot.js
const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const ChatMessage = require('../models/ChatMessage');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/chat', async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message || !sessionId) {
    return res.status(400).json({ error: 'Message and sessionId are required' });
  }

  const handbookText = `
Company Handbook:
- Dress Code: Employees are expected to wear business casual attire Monday to Thursday, and smart casual on Fridays.
- Leave Days: Full-time staff are entitled to 14 days of annual leave per year.
- Sick Leave: Submit your medical certificate to HR via email within 2 days of absence.
- Working Hours: Standard working hours are 9:00 AM to 6:00 PM, Monday to Friday.
- Remote Work Policy: Employees can work remotely up to 2 days per week with manager approval.
`;

  const prompt = `
You are a helpful assistant who answers questions based on the company handbook below.

Handbook:
${handbookText}

User Question:
${message}

Please answer based on the handbook. If the question is unrelated, politely inform the user you can only answer questions related to the handbook. You can accept thank yous and goodbyes.
`;

  try {
    // Save user message
    await ChatMessage.create({ sessionId, role: 'user', message });

    // Get response
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const botReply = completion.choices[0].message.content;

    // Save bot reply
    await ChatMessage.create({ sessionId, role: 'bot', message: botReply });

    res.json({ reply: botReply });
  } catch (error) {
    console.error('Error in chatbot route:', error.message);
    res.status(500).json({ error: 'Chatbot generation failed' });
  }
});

// Get chat history by session
router.get('/history/:sessionId', async (req, res) => {
  try {
    const messages = await ChatMessage.find({ sessionId: req.params.sessionId }).sort({ timestamp: 1 });
    const formatted = messages.map(msg => ({
      text: msg.message,
      isUser: msg.role === 'user',
    }));
    res.json({ messages: formatted });
  } catch (error) {
    console.error('Error fetching chat history:', error.message);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

module.exports = router;

