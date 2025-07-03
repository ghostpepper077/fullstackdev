const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// --- Model Imports ---
const Candidate = require('./models/Candidate');
const Job = require('./models/jobs');
const Criteria = require('./models/Criteria');

const app = express();

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS setup
app.use(cors({ 
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true 
}));

// --- MongoDB Connection ---
mongoose
  .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ===================================================================
// ★★★ API ROUTES ★★★
// ===================================================================

// --- Routers from separate files ---
const userRoutes = require("./routes/user");
const interviewRoutes = require('./routes/interviewRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const criteriaRoutes = require("./routes/criteria");
// Note: We are defining job routes directly below for now. 
// You can move them to a 'routes/jobs.js' file later if you wish.

app.use('/api/user', userRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/criteria', criteriaRoutes);

// --- Job CRUD Routes ---
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await Job.find({}).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) { res.status(500).json({ message: 'Server error fetching jobs.' }); }
});

app.post('/api/jobs', async (req, res) => {
  try {
    const { role } = req.body; // Using 'role' to match your schema
    if (!role) return res.status(400).json({ message: 'Role is required.' });
    const newJob = new Job({ role });
    await newJob.save();
    res.status(201).json(newJob);
  } catch (error) { res.status(500).json({ message: 'Server error creating job.' }); }
});

// --- Candidate Routes ---// 🔹 Route 1: Top 5 candidates for shortlisting
app.get('/api/candidates', async (req, res) => {
  try {
    const topCandidates = await Candidate.find({})
      .sort({ match: -1 }) // Highest match first
      .limit(5);

    res.json(topCandidates);
  } catch (error) {
    console.error('Error fetching top candidates:', error);
    res.status(500).json({ message: 'Server error while fetching top candidates.' });
  }
});

// 🔹 Route 2: All candidates for scheduling
app.get('/api/candidates/all', async (req, res) => {
  try {
    const allCandidates = await Candidate.find({});
    res.json(allCandidates);
  } catch (error) {
    console.error('Error fetching all candidates:', error);
    res.status(500).json({ message: 'Server error while fetching all candidates.' });
  }
});

// --- Criteria Routes ---
// POST new job criteria
app.post('/api/criteria', async (req, res) => {
  try {
    // skills comes in as a single string: "Node.js, Being good"
    const { jobId, experience, skills } = req.body;

    if (!jobId || !experience || !skills) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    // Convert the skills string into an array of strings
    const skillsArray = skills.split(',').map(skill => skill.trim());
    
    const newCriteria = new Criteria({
      jobId,
      experience,
      skills: skillsArray // Save the corrected array to the database
    });

    await newCriteria.save();
    res.status(201).json(newCriteria);
  } catch (error) {
    console.error('Error creating criteria:', error);
    res.status(500).json({ message: 'Server error while creating criteria.' });
  }
});

app.get('/api/criteria/options', async (req, res) => {
  try {
    // Use Promise.all to fetch all options concurrently
    const [experienceOptions, skillsOptions, jobOptions] = await Promise.all([
      Criteria.distinct('experience'),
      Criteria.distinct('skills'),
      Job.find({}).select('role').sort({ role: 1 }) // Fetch all jobs, sorted
    ]);

    res.json({
      experience: experienceOptions,
      skills: skillsOptions,
      jobs: jobOptions // Include jobs in the response
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ message: 'Server error while fetching options.' });
  }
});

// --- Error Handling Middleware ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// --- Start the Server ---
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`⚡ Server running on http://localhost:${port}`);
});