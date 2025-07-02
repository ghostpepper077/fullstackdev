const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');

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
