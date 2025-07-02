const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// --- Model Imports ---
const User = require("./routes/user"); // Note: This seems to be a router, not a model. Naming might be confusing.
const Candidate = require('./models/Candidate');
const Criteria = require('./models/Criteria');

const app = express();

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS setup to allow requests from your React frontend
app.use(cors({ 
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true 
}));

// --- MongoDB Connection ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// --- API Routes ---

// Existing User Routes
app.use("/api/user", User); // Assuming 'User' is the user router

// GET all candidates
app.get('/api/candidates', async (req, res) => {
  try {
    const candidates = await Candidate.find({});
    res.json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ message: 'Server error while fetching candidates.' });
  }
});

// POST new job criteria
app.post('/api/criteria', async (req, res) => {
  try {
    const { jobId, experience, skills: skillsString } = req.body;

    // Validate required fields
    if (!jobId || !experience || !skillsString) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    // Convert skills string to an array
    const skillsArray = skillsString.split(',').map(skill => skill.trim());
    
    const newCriteria = new Criteria({
      jobId,
      experience,
      skills: skillsArray
    });

    await newCriteria.save();
    res.status(201).json(newCriteria);
  } catch (error) {
    console.error('Error creating criteria:', error);
    res.status(500).json({ message: 'Server error while creating criteria.' });
  }
});

// GET unique filter options for the shortlisting page
app.get('/api/criteria/options', async (req, res) => {
  try {
    // Fetch all unique 'experience' values from the Criteria collection
    const experienceOptions = await Criteria.distinct('experience');
    
    // Fetch all unique 'skills' values from the Criteria collection
    const skillsOptions = await Criteria.distinct('skills');

    res.json({
      experience: experienceOptions,
      skills: skillsOptions
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ message: 'Server error while fetching options.' });
  }
});


// --- General Error Handling Middleware ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// --- Start the Server ---
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`⚡ Server running on http://localhost:${port}`);
});