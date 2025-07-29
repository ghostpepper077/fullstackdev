const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('/generate-email', async (req, res) => {
  const { candidate, interview, type } = req.body;

  try {
    const prompt = `
Write a ${type === 'reject' ? 'polite rejection' : 'congratulatory'} email for a candidate.
Name: ${candidate.name}
Position: ${candidate.role}
Skills: ${candidate.skills?.join(', ')}
Scheduled Interview: ${interview?.date || '-'} at ${interview?.time || '-'}
Interviewer: ${interview?.interviewer || '-'}

Make the email sound professional and friendly.
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });

    const responseText = completion.choices[0].message.content;
    res.json({ message: responseText });
  } catch (error) {
    console.error('Error generating email:', error.message);
    res.status(500).json({ error: 'AI generation failed' });
  }
});

module.exports = router;




