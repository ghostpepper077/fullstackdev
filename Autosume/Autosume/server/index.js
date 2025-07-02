const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Candidate = require('./models/Candidate');
require("dotenv").config();

const app = express();

// Middleware (exactly as you had it)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS (unchanged)
app.use(cors({ 
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true 
}));

// MongoDB connection (only added timeout to prevent hanging)
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000 // 5-second connection timeout
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => {
  console.error("❌ MongoDB connection error:", err.message); // Cleaner error logging
  process.exit(1);
});

// Routes (your original)
const userRoutes = require('./routes/user');
app.use('/api/user', userRoutes);

// ===================================================================
// ★★★ CHANGE THIS LINE ★★★
// Add the "/api" prefix to match your other routes
// ===================================================================
app.get('/api/candidates', async (req, res) => {
  try {
    const candidates = await Candidate.find({});
    res.json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ message: 'Server error while fetching candidates.' });
  }
});
// ===================================================================

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' }); // Consistent error format
});

// Start server (unchanged)
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

const jobRoutes = require('./routes/jobs'); // ← Add this

app.use('/api/user', userRoutes);
app.use('/api/jobs', jobRoutes);            // ← Mount this

