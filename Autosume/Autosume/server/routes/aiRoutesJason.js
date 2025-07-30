// routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/generate-description', async (req, res) => {
  const { role, timing, jobType } = req.body;

  const prompt = `Write a professional job description for a ${jobType} ${role} role. The work timing is ${timing}. Make it attractive and concise for job seekers.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });

    const description = completion.choices[0].message.content;
    res.json({ description });
  } catch (err) {
    console.error('AI generation error:', err);
    res.status(500).json({ error: 'Failed to generate job description' });
  }
});

module.exports = router;
