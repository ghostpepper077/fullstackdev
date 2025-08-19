// models/auditLog.js
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g. CREATED, UPDATED, DELETED, STATUS_CHANGED
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  details: { type: Object }, // store snapshot of job or changed fields
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
