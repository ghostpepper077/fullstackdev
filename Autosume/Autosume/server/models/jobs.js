const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  role: {
    type: String,
    required: [true, 'Job role is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  applicants: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Active', 'Closed'],
    default: 'Active'
  }
});

// 👇 The third argument 'jobs' tells Mongoose to use that exact collection name
module.exports = mongoose.model('Job', jobSchema, 'jobs');
