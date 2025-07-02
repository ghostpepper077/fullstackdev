const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());

// CORS setup
// Make sure CLIENT_URL is defined in your .env file (e.g., CLIENT_URL=http://localhost:3000)
app.use(cors({ origin: process.env.CLIENT_URL }));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI) // Note: useNewUrlParser is no longer needed in modern Mongoose
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // Exit the process if the database connection fails
  });

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the Autosume server.");
});

// Use your existing routes
const userRoute = require("./routes/user");
app.use("/user", userRoute);

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// Start the server
const port = process.env.APP_PORT || 5000;
app.listen(port, () => {
  console.log(`⚡ Server running on http://localhost:${port}`);
});