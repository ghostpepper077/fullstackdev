const mongoose = require('mongoose');

const ScreenedCandidateSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String 
  },
  skills: { 
    type: [String], 
    default: [] 
  },
  matchedSkills: { 
    type: [String], 
    default: [] 
  },
  missingSkills: { 
    type: [String], 
    default: [] 
  },
  experience: { 
    type: String 
  },
  education: { 
    type: String 
  },
  summary: { 
    type: String 
  },
  matchPercentage: { 
    type: Number, 
    min: 0, 
    max: 100 
  },
  // Add match field as alias for matchPercentage for backward compatibility
  match: { 
    type: Number, 
    min: 0, 
    max: 100 
  },
  strengths: { 
    type: [String], 
    default: [] 
  },
  weaknesses: { 
    type: [String], 
    default: [] 
  },
  recommendation: { 
    type: String 
  },
  role: { 
    type: String, 
    required: true 
  },
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job', 
    required: true 
  },
      status: { type: String, enum: ['Screened','Unscheduled','Scheduled','Emailed','Shortlisted','Rejected','Hired'], default: 'Screened' },
  screeningDate: { 
    type: Date, 
    default: Date.now 
  },
  // Add dateScreened as alias for screeningDate for backward compatibility
  dateScreened: { 
    type: Date, 
    default: Date.now 
  },
  notes: { 
    type: String 
  },
  // Additional fields that might be used by the screening system
  aiSummary: {
    type: String,
    default: ''
  },
  experienceDetails: {
    type: String,
    default: ''
  },
  educationDetails: {
    type: String,
    default: ''
  },

  // NEW: schedule fields (live on ScreenedCandidate now)
  date: { type: String, default: '-' },       // e.g. '2025-08-19'
  time: { type: String, default: '-' },       // e.g. '14:30'
  interviewer: { type: String, default: '-' },
}, { 
  timestamps: true 
});

// Create compound index for unique email + jobId combination
ScreenedCandidateSchema.index({ email: 1, jobId: 1 }, { unique: true });

// Index for efficient sorting by match score
ScreenedCandidateSchema.index({ match: -1, matchPercentage: -1, screeningDate: -1 });

// Virtual to sync match and matchPercentage fields
ScreenedCandidateSchema.pre('save', function(next) {
  // Sync match and matchPercentage fields
  if (this.matchPercentage && !this.match) {
    this.match = this.matchPercentage;
  } else if (this.match && !this.matchPercentage) {
    this.matchPercentage = this.match;
  }
  
  // Sync dateScreened and screeningDate fields
  if (this.screeningDate && !this.dateScreened) {
    this.dateScreened = this.screeningDate;
  } else if (this.dateScreened && !this.screeningDate) {
    this.screeningDate = this.dateScreened;
  }
  
  next();
});

module.exports = mongoose.model('ScreenedCandidate', ScreenedCandidateSchema);