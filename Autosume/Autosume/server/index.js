require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

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

// Error handler (simplified)
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

