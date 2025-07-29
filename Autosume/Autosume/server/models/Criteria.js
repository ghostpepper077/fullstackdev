
const mongoose = require('mongoose');

const criteriaSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  experience: { type: String, required: true },
  skills: [{ type: String, required: true }]
});

module.exports = mongoose.model('Criteria', criteriaSchema);