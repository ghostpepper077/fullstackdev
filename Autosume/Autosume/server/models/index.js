const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// --- Model Imports ---
const User = require("./routes/user");
const Candidate = require('./models/Candidate');
const Criteria = require('./models/Criteria');
const Job = require('./models/Job');

const app = express();

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ 
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true 
}));

// --- MongoDB Connection ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => { console.error("❌ MongoDB connection error:", err); process.exit(1); });

// --- API Routes ---
app.use("/api/user", User);
app.get('/api/jobs', async (req, res) => { /* ... existing code ... */ });
app.get('/api/candidates', async (req, res) => { /* ... existing code ... */ });
app.get('/api/criteria/options', async (req, res) => { /* ... existing code ... */ });

// ===================================================================
// ★★★ CRITERIA CRUD ROUTES ★★★
// ===================================================================

// POST a new criterion (Create)
app.post('/api/criteria', async (req, res) => {
  try {
    const { jobId, experience, skills: skillsString } = req.body;
    if (!jobId || !experience || !skillsString) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }
    const skillsArray = skillsString.split(',').map(skill => skill.trim());
    const newCriteria = new Criteria({ jobId, experience, skills: skillsArray });
    await newCriteria.save();
    res.status(201).json(newCriteria);
  } catch (error) {
    res.status(500).json({ message: 'Server error while creating criteria.' });
  }
});

// GET all criteria (Read)
app.get('/api/criteria', async (req, res) => {
  try {
    // Populate 'jobId' to get the job title from the Job model
    const criteria = await Criteria.find({}).populate('jobId', 'title').sort({ createdAt: -1 });
    res.json(criteria);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching criteria.' });
  }
});

// PUT (update) a criterion by ID (Update)
app.put('/api/criteria/:id', async (req, res) => {
    try {
        const { jobId, experience, skills: skillsString } = req.body;
        const skillsArray = skillsString.split(',').map(skill => skill.trim());

        const updatedCriteria = await Criteria.findByIdAndUpdate(
            req.params.id,
            { jobId, experience, skills: skillsArray },
            { new: true } // Return the updated document
        );
        if (!updatedCriteria) {
            return res.status(404).json({ message: 'Criteria not found.' });
        }
        res.json(updatedCriteria);
    } catch (error) {
        res.status(500).json({ message: 'Server error while updating criteria.' });
    }
});

// DELETE a criterion by ID (Delete)
app.delete('/api/criteria/:id', async (req, res) => {
    try {
        const deletedCriteria = await Criteria.findByIdAndDelete(req.params.id);
        if (!deletedCriteria) {
            return res.status(404).json({ message: 'Criteria not found.' });
        }
        res.json({ message: 'Criteria deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error while deleting criteria.' });
    }
});
// ===================================================================


// --- Error Handling & Server Start ---
app.use((err, req, res, next) => { console.error(err.stack); res.status(500).json({ message: 'Something went wrong!' }); });
const port = process.env.PORT || 5000;
app.listen(port, () => { console.log(`⚡ Server running on http://localhost:${port}`); });