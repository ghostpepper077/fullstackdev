const express = require('express');
const router = express.Router();
const Job = require('../models/jobs'); // adjust path if needed

// POST /api/jobs → create a new job
router.post('/', async (req, res) => {
  try {
    const {
      role,
      description,
      deadline,
      salaryRange,
      timing,
      jobType,
      department
    } = req.body;

    if (!role || !description || !deadline || !salaryRange || !timing || !department) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newJob = new Job({
      role,
      description,
      deadline,
      salaryRange,
      timing,
      jobType,
      department,
      applicants: 0,
      createdAt: new Date(),
      status: 'Active'
    });

    await newJob.save();
    res.status(201).json(newJob);
  } catch (err) {
    console.error('❌ Failed to create job:', err.message);
    res.status(500).json({ error: 'Failed to create job' });
  }
});


// GET /api/jobs → fetch jobs for dropdown (only _id and title)
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find({}, { _id: 1, role: 1 }); // Assuming 'role' is your job title field
    res.json(jobs);
  } catch (err) {
    console.error('❌ Failed to fetch jobs:', err.message);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// NEW! GET /api/jobs/:id → fetch full job details for edit page
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Format salaryRange string (if stored separately)
    let salaryRange = '';
    if (job.salaryMin !== undefined && job.salaryMax !== undefined) {
      salaryRange = `${job.salaryMin} ~ ${job.salaryMax}`;
    } else if (job.salaryRange) {
      salaryRange = job.salaryRange;
    }

    res.json({
      role: job.role,
      timing: job.timing,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      salaryRange,
      jobType: job.jobType,
      deadline: job.deadline ? job.deadline.toISOString() : null,
      description: job.description,
      status: job.status,
      applicants: job.applicants,
      createdAt: job.createdAt,
      department: job.department, 
      _id: job._id,
    });

  } catch (err) {
    console.error('❌ Failed to fetch job:', err.message);
    res.status(500).json({ error: 'Failed to fetch job' });
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
