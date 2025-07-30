import mongoose from 'mongoose';

const ScreenedCandidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  skills: { type: [String], default: [] },
  matchedSkills: { type: [String], default: [] },
  missingSkills: { type: [String], default: [] },
  experience: { type: String },
  education: { type: String },
  summary: { type: String },
  matchPercentage: { type: Number, min: 0, max: 100 },
  strengths: { type: [String], default: [] },
  weaknesses: { type: [String], default: [] },
  recommendation: { type: String },
  role: { type: String, required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  status: { 
    type: String, 
    enum: ['Screened', 'Shortlisted', 'Rejected', 'Hired'], 
    default: 'Screened' 
  },
  screeningDate: { type: Date, default: Date.now },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.model('ScreenedCandidate', ScreenedCandidateSchema);