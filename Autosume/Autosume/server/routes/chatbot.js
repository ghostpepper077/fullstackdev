const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Define your company handbook here
  const handbookText = `
Company Handbook:
- Dress Code: Employees are expected to wear business casual attire Monday to Thursday, and smart casual on Fridays.
- Leave Days: Full-time staff are entitled to 14 days of annual leave per year.
- Sick Leave: Submit your medical certificate to HR via email within 2 days of absence.
- Working Hours: Standard working hours are 9:00 AM to 6:00 PM, Monday to Friday.
- Remote Work Policy: Employees can work remotely up to 2 days per week with manager approval.
`;

  // Create the prompt for OpenAI
  const prompt = `
You are a helpful assistant who answers questions based on the company handbook below.

Handbook:
${handbookText}

User Question:
${message}

Please answer based on the handbook. If the question is unrelated, politely inform the user you can only answer questions related to the handbook. You can accept thank yous and goodbyes
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const responseText = completion.choices[0].message.content;
    res.json({ reply: responseText });
  } catch (error) {
    console.error('Error in chatbot route:', error.message);
    res.status(500).json({ error: 'Chatbot generation failed' });
  }
});

module.exports = router;
