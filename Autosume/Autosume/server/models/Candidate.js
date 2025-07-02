const mongoose = require("mongoose");

const CandidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    match: {
      type: Number,
      default: 0,
    },
    skills: {
      type: [String], // Defines an array of strings
      default: [],
    },
    experience: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    overview: {
      type: String,
      default: "",
    },
    experienceDetails: {
      type: String,
      default: "",
    },
    education: {
      type: String,
      default: "",
    },
    aiSummary: {
      type: String,
      default: "",
    },

    role: { type: String, default: "" },
    date: { type: String, default: "" },
    time: { type: String, default: "" },
    interviewer: { type: String, default: "" },
    status: { type: String, default: "Not Sent" },
  },
  {
    // Automatically add 'createdAt' and 'updatedAt' fields
    timestamps: true,
  }
);

// The collection will be named 'candidates' (pluralized and lowercased)
module.exports = mongoose.model("Candidate", CandidateSchema);
