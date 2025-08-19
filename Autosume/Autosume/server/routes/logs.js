// routes/audit.js
const express = require('express');
const router = express.Router();
const AuditLog = require('../models/auditlog');

// GET /api/audit → list all logs
router.get('/', async (req, res) => {
  try {
    const logs = await AuditLog.find().populate('jobId', 'role department');
    res.json(logs);
  } catch (err) {
    console.error('❌ Failed to fetch audit logs:', err.message);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

module.exports = router;
