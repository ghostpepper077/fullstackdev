const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');

router.get('/all', async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/schedule', async (req, res) => {
  try {
    const { name, date, time, interviewer } = req.body;

    const updated = await Candidate.findOneAndUpdate(
  { name: new RegExp(`^${name}$`, 'i') }, // case-insensitive match
  { $set: { date, time, interviewer, status: 'Scheduled' } },
  { new: true }
);


    if (!updated) return res.status(404).json({ error: 'Candidate not found' });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
