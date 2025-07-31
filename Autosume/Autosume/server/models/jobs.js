const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  role: { type: String, required: true },
  description: { type: String, required: true },
  deadline: { type: Date, required: true },
  salaryRange: { type: String, required: true },
  timing: { type: String, required: true },
  jobType: { type: String, default: 'Full Time' },
  applicants: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active', 'Closed'], default: 'Active' }
});


// Use exact collection name 'jobs'
module.exports = mongoose.model('Job', jobSchema, 'jobs');
