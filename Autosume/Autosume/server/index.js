const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose"); // ✅ Add this
require("dotenv").config();

const app = express();
app.use(express.json());

// CORS setup
app.use(cors({ origin: process.env.CLIENT_URL }));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the learning space.");
});

const userRoute = require("./routes/user");
app.use("/user", userRoute);

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const port = process.env.APP_PORT || 5000;
app.listen(port, () => {
  console.log(`⚡ Server running on http://localhost:${port}`);
});
