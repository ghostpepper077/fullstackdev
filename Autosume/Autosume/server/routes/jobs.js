const express = require('express');
const router = express.Router();
const Job = require('../models/jobs'); // make sure this matches your path

// POST /api/jobs → create a new job
router.post('/', async (req, res) => {
  try {
    const newJob = new Job(req.body);
    await newJob.save();
    res.status(201).json(newJob);
  } catch (err) {
    console.error('❌ Failed to create job:', err.message);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// GET /api/jobs → fetch all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (err) {
    console.error('❌ Failed to fetch jobs:', err.message);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// DELETE /api/jobs/:id → delete a job
router.delete('/:id', async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (err) {
    console.error('❌ Failed to delete job:', err.message);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

module.exports = router;
