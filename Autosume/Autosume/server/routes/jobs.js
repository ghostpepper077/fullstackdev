const express = require('express');
const router = express.Router();
const Job = require('../models/jobs');
const AuditLog = require('../models/auditlog'); // ✅ new import

// Utility: save audit log
async function logAction(action, jobId, details = {}) {
  try {
    const log = new AuditLog({ action, jobId, details });
    await log.save();
  } catch (err) {
    console.error('❌ Failed to save audit log:', err.message);
  }
}

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
    await logAction('CREATED', newJob._id, { role, department });

    res.status(201).json(newJob);
  } catch (err) {
    console.error('❌ Failed to create job:', err.message);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// GET /api/jobs → fetch jobs for dropdown
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find({}, { _id: 1, role: 1 });
    res.json(jobs);
  } catch (err) {
    console.error('❌ Failed to fetch jobs:', err.message);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// GET /api/jobs/:id → fetch job details
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    let salaryRange = job.salaryRange || '';
    if (job.salaryMin !== undefined && job.salaryMax !== undefined) {
      salaryRange = `${job.salaryMin} ~ ${job.salaryMax}`;
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

// PUT /api/jobs/:id → update job (including status toggle)
router.put('/:id', async (req, res) => {
  try {
    const { role, description, deadline, salaryRange, timing, jobType, department, status } = req.body;

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { role, description, deadline, salaryRange, timing, jobType, department, status },
      { new: true }
    );

    if (!updatedJob) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // log status change to audit log
    if (status) {
      const AuditLog = require('../models/auditlog');
      await AuditLog.create({
        action: `Job status changed to ${status}`,
        jobId: updatedJob._id,
        timestamp: new Date(),
      });
    }

    res.json(updatedJob);
  } catch (err) {
    console.error('❌ Failed to update job:', err.message);
    res.status(500).json({ error: 'Failed to update job' });
  }
});



// DELETE /api/jobs/:id → delete a job
router.delete('/:id', async (req, res) => {
  try {
    const deletedJob = await Job.findByIdAndDelete(req.params.id);
    if (!deletedJob) return res.status(404).json({ error: 'Job not found' });

    await logAction('DELETED', deletedJob._id, { role: deletedJob.role });

    res.json({ message: 'Job deleted' });
  } catch (err) {
    console.error('❌ Failed to delete job:', err.message);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});
// PATCH /api/jobs/:id/status → toggle job status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body; // expected 'active' or 'closed'

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    job.status = status;
    await job.save();

    // Optionally: create an audit log entry
    // Example: await Log.create({ user: 'Admin', action: `changed status to ${status}`, jobRole: job.role });

    res.json(job);
  } catch (err) {
    console.error('❌ Failed to update job status:', err.message);
    res.status(500).json({ error: 'Failed to update job status' });
  }
});


module.exports = router;
