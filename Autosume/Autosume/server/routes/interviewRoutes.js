const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');

// Helper to combine date + "h:mm AM/PM" into a Date
function toDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const [tp, mer] = timeStr.split(" ");
  if (!tp || !mer) return null;
  let [h, m] = tp.split(":").map(Number);
  if (/PM/i.test(mer) && h !== 12) h += 12;
  if (/AM/i.test(mer) && h === 12) h = 0;

  const dt = new Date(dateStr);
  if (isNaN(dt)) return null;
  dt.setHours(h, m ?? 0, 0, 0);
  return dt;
}

// Get all candidates
router.get('/all', async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Schedule an interview with conflict & past-time check
router.post('/schedule', async (req, res) => {
  try {
    const { name, date, time, interviewer } = req.body;

    // Validate and reject past datetime (covers past days and same-day past times)
    const interviewDT = toDateTime(date, time);
    if (!interviewDT) {
      return res.status(400).json({ error: "Invalid date/time." });
    }
    const now = new Date();
    if (interviewDT < now) {
      return res.status(400).json({ error: "Cannot schedule in the past." });
    }

    // Check for existing interview conflict
    const normalized = (interviewer || "").trim().replace(/\s+/g, " ");
    const conflict = await Candidate.findOne({
      date,
      time,
      interviewer: new RegExp(`^${normalized}$`, 'i'),
    });

    if (conflict) {
      return res.status(409).json({
        error: `Conflict: ${interviewer} already has an interview scheduled at ${time} on ${date}.`,
      });
    }

    // Update candidate schedule
    const updated = await Candidate.findOneAndUpdate(
      { name: new RegExp(`^${name}$`, 'i') },
      { $set: { date, time, interviewer, status: 'Scheduled' } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Candidate not found' });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear a scheduled interview
router.put('/clear/:id', async (req, res) => {
  try {
    const cleared = await Candidate.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          date: "-",
          time: "-",
          interviewer: "-",
          status: "Unscheduled",
        },
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
