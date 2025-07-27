const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const { OpenAI } = require('openai');


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.get('/ai-optimal-slot', async (req, res) => {
  try {
    const scheduled = await Candidate.find({
      date: { $ne: '-' },
      time: { $ne: '-' },
      interviewer: { $ne: '-' }
    });

    const prompt = `
Given these existing interview schedules:

${scheduled.map(s => `${s.name} on ${s.date} at ${s.time} with ${s.interviewer}`).join('\n')}

Suggest one optimal interview slot (date, time, interviewer) within the next 14 days with minimal conflict and even distribution. Just return JSON like:
{ "date": "2025-08-03", "time": "10:00 AM", "interviewer": "Gabriel Tan" }
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a scheduling assistant.' },
        { role: 'user', content: prompt },
      ],
    });

    const suggestion = completion.choices[0].message.content;
    const parsed = JSON.parse(suggestion);
    res.json(parsed);
  } catch (error) {
    console.error('AI scheduling error:', error.message);
    res.status(500).json({ error: 'Failed to generate optimal slot.' });
  }
});

// Return all occupied interview slots
router.get('/availability', async (req, res) => {
  try {
    const candidates = await Candidate.find({ status: { $ne: 'Not Sent' } });

    const takenSlots = candidates.map((c) => {
      return `${c.date}__${c.time}__${c.interviewer}`;
    });

    res.json(takenSlots);
  } catch (error) {
    console.error('Error getting availability:', error.message);
    res.status(500).json({ message: 'Server error while fetching slots' });
  }
});

module.exports = router;
