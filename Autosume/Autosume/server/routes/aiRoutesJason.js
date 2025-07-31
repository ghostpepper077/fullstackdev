const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/generate-description', async (req, res) => {
  const { role, pointers } = req.body;

  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];

  const prompt = `
You are an HR assistant. Given the role: "${role}" and these user-provided pointers: "${pointers}", generate a professional job posting.

Output ONLY this JSON format:
{
  "description": "...",
  "timing": "...",
  "salaryMin": "...",
  "salaryMax": "...",
  "jobType": "Full Time | Part Time | Contract | Internship",
  "deadline": "YYYY-MM-DD" // must be in the future (after ${formattedDate})
}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // ✅ use cheaper model
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = completion.choices[0].message.content;

    // Try parsing the JSON from AI response
    const data = JSON.parse(raw);
    res.json(data);
  } catch (err) {
    console.error('AI generation error:', err);
    res.status(500).json({ error: 'Failed to generate job description' });
  }
});

module.exports = router;
