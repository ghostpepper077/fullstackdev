require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

// Import email service (added new service for email handling)
const emailService = require("./services/emailService"); // Import email service

const app = express();

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// --- Model Imports ---
const Candidate = require("./models/Candidate");
const Job = require("./models/jobs");
const Criteria = require("./models/Criteria");

// --- Routers ---
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const interviewRoutes = require('./routes/interviewRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const criteriaRoutes = require('./routes/criteria');
const aiRoutes = require('./routes/aiRoutes');
const chatbotRoutes = require('./routes/chatbot');
const aiRoutesJason = require('./routes/aiRoutesJason');

// Import the missing aiHariz routes
const aiHariz = require('./routes/aiHariz');

// --- Use Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/criteria', criteriaRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/ai', aiRoutesJason);
app.use('/api/logs', require('./routes/logs'));


// Register the aiHariz routes
app.use('/api', aiHariz);

// --- Job Routes ---
app.get("/api/jobs", async (req, res) => {
  try {
    const jobs = await Job.find({}).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Server error fetching jobs." });
  }
});

app.post('/api/jobs', async (req, res) => {
  try {
    const {
      role,
      description,
      deadline,
      salaryRange,
      timing,
      jobType,
      department // 🆕 Add this line
    } = req.body;

    if (!role || !description || !deadline || !salaryRange || !timing || !department) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const job = new Job({
      role,
      description,
      deadline,
      salaryRange,
      timing,
      jobType,
      department,
      applicants: 0,
      createdAt: new Date()
    });

    await job.save();
    res.status(201).json(job);
  } catch (err) {
    console.error('Error creating job:', err);
    res.status(500).json({ message: err.message });
  }
});


app.get('/api/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).json({ message: 'Server error fetching job.' });
  }
});

app.put('/api/jobs/:id', async (req, res) => {
  try {
    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedJob) return res.status(404).json({ message: 'Job not found' });
    res.json(updatedJob);
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ message: 'Server error updating job.' });
  }
});

app.delete('/api/jobs/:id', async (req, res) => {
  try {
    const deletedJob = await Job.findByIdAndDelete(req.params.id);
    if (!deletedJob) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job deleted successfully', job: deletedJob });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ message: 'Server error deleting job.' });
  }
});

// --- Candidate Routes ---
app.get("/api/candidates", async (req, res) => {
  try {
    const topCandidates = await Candidate.find({}).sort({ match: -1 }).limit(5);
    res.json(topCandidates);
  } catch (error) {
    console.error("Error fetching candidates:", error);  
    res.status(500).json({ message: "Server error fetching candidates." });
  }
});

app.get('/api/candidates/all', async (req, res) => {
  try {
    const allCandidates = await Candidate.find({});
    res.json(allCandidates);
  } catch (error) {
    console.error("Error fetching all candidates:", error);
    res.status(500).json({ message: 'Server error fetching all candidates.' });
  }
});

// --- Criteria Routes ---
app.post('/api/criteria', async (req, res) => {
  try {
    const { jobId, experience, skills } = req.body;
    if (!jobId || !experience || !skills) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const skillsArray = skills.split(',').map(skill => skill.trim());

    const newCriteria = new Criteria({ jobId, experience, skills: skillsArray });
    await newCriteria.save();
    res.status(201).json(newCriteria);
  } catch (error) {
    console.error("Error creating criteria:", error);
    res.status(500).json({ message: 'Server error creating criteria.' });
  }
});

app.get('/api/criteria/options', async (req, res) => {
  try {
    const [experienceOptions, skillsOptions, jobOptions] = await Promise.all([
      Criteria.distinct('experience'),
      Criteria.distinct('skills'),
      Job.find({}).select('role').sort({ role: 1 })
    ]);

    res.json({
      experience: experienceOptions,
      skills: skillsOptions,
      jobs: jobOptions
    });
  } catch (error) {
    console.error("Error fetching criteria options:", error);
    res.status(500).json({ message: 'Server error fetching options.' });
  }
});

// --- Error Handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// --- Serve React Frontend ---
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../client/build", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running...");
  });
}

// --- Connect to MongoDB and Start Server ---
mongoose
  .connect(process.env.MONGO_URI || process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`⚡ Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });