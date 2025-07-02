const mongoose = require('mongoose');

const CriteriaSchema = new mongoose.Schema({
  // Link to the job it belongs to
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job', // Assuming you have a 'Job' model
    required: true
  },
  experience: {
    type: String,
    required: true,
    trim: true
  },
  skills: {
    type: [String], // An array of skills
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Criteria', CriteriaSchema);