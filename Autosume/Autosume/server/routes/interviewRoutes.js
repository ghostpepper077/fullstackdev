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
router.put('/clear/:id', async (req, res) => {
  try {
    const cleared = await Candidate.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          date: "-",
          time: "-",
          interviewer: "-",
          status: "Not Sent"
        }
      },
      { new: true }
    );

    if (!cleared) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    res.json({ message: 'Interview schedule cleared', candidate: cleared });
  } catch (err) {
    console.error("❌ Failed to clear schedule:", err);
    res.status(500).json({ message: 'Error clearing schedule' });
  }
});


module.exports = router;
