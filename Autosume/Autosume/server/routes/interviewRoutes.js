const express = require('express');
const router = express.Router();
const ScreenedCandidate = require('../models/ScreenedCandidate');

// Helper: combine date string + "h:mm AM/PM" into a Date object (for past-time checks)
function toDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const [tp, mer] = timeStr.split(' ');
  if (!tp || !mer) return null;
  let [h, m] = tp.split(':').map(Number);
  if (/PM/i.test(mer) && h !== 12) h += 12;
  if (/AM/i.test(mer) && h === 12) h = 0;
  const dt = new Date(dateStr);
  if (isNaN(dt)) return null;
  dt.setHours(h, m ?? 0, 0, 0);
  return dt;
}

// GET /api/interviews/all
// Return screened candidates (optionally filter by status)
router.get('/all', async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) {
      // Special treatment: "Screened" means not yet booked
      query.status = status === 'Screened' ? { $in: ['Screened', 'Unscheduled'] } : status;
    }
    const rows = await ScreenedCandidate.find(query).sort({ screeningDate: -1 });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch interviews', detail: err.message });
  }
});

// POST /api/interviews/schedule
// Schedule by email (preferred) or name (+ optional jobId)
router.post('/schedule', async (req, res) => {
  try {
    const { email, name, jobId, role, date, time, interviewer } = req.body;

    if (!email && !name) return res.status(400).json({ error: 'Missing email or name' });
    if (!date || !time || !interviewer) return res.status(400).json({ error: 'Missing date/time/interviewer' });

    // Reject past datetime (covers past days & same-day past time)
    const interviewDT = toDateTime(date, time);
    if (!interviewDT) return res.status(400).json({ error: 'Invalid date/time.' });
    const now = new Date();
    if (interviewDT < now) return res.status(400).json({ error: 'Cannot schedule in the past.' });

    // Identify candidate first (we'll exclude them in conflict check)
    const idQuery = email
      ? { email: new RegExp(`^${email}$`, 'i'), ...(jobId ? { jobId } : {}) }
      : { name: new RegExp(`^${name}$`, 'i'), ...(jobId ? { jobId } : {}) };
    const cand = await ScreenedCandidate.findOne(idQuery);
    if (!cand) return res.status(404).json({ error: 'Screened candidate not found' });

    // Conflict: SAME interviewer/date/time on ANOTHER candidate
    const normalizedIv = (interviewer || '').trim().replace(/\s+/g, ' ');
    const conflict = await ScreenedCandidate.findOne({
      _id: { $ne: cand._id },
      date, time,
      interviewer: new RegExp(`^${normalizedIv}$`, 'i'),
      status: 'Scheduled',
    });
    if (conflict) {
      return res.status(409).json({
        error: `Conflict: ${interviewer} already has an interview at ${time} on ${date}.`,
      });
    }
    // Update by _id (idempotent if same values are posted again)
   cand.role = role || cand.role;
    cand.date = date;
    cand.time = time;
    cand.interviewer = interviewer;
    cand.status = 'Scheduled';
    const updated = await cand.save();

    res.json({ ok: true, candidate: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to schedule', detail: err.message });
  }
});

// PUT /api/interviews/clear/:id
// Clear schedule -> Unscheduled
router.put('/clear/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await ScreenedCandidate.findByIdAndUpdate(
      id,
      { $set: { date: '-', time: '-', interviewer: '-', status: 'Unscheduled' } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Screened candidate not found' });
    res.json({ ok: true, candidate: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear schedule', detail: err.message });
  }
});

// PUT /api/interviews/mark-sent
// After email, keep as Scheduled (or set to "Emailed" if you want that stage)
router.put('/mark-sent', async (req, res) => {
  try {
    const { email, name, jobId, status = 'Scheduled' } = req.body;
    if (!email && !name) return res.status(400).json({ error: 'Missing email or name' });

    const idQuery = email
      ? { email: new RegExp(`^${email}$`, 'i'), ...(jobId ? { jobId } : {}) }
      : { name: new RegExp(`^${name}$`, 'i'), ...(jobId ? { jobId } : {}) };

    const updated = await ScreenedCandidate.findOneAndUpdate(
      idQuery,
      { $set: { status } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Screened candidate not found' });

    res.json({ ok: true, candidate: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark sent', detail: err.message });
  }
});

module.exports = router;
