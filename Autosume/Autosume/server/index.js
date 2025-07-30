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
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const interviewRoutes = require("./routes/interviewRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const criteriaRoutes = require("./routes/criteria");
const aiRoutes = require("./routes/aiRoutes");

// --- Use Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/criteria", criteriaRoutes);
app.use("/api/ai", aiRoutes);

// --- New Email Routes ---
// Send OTP email (Example route for email)
app.post("/api/email/send-reset-otp", async (req, res) => {
  const { email, recipientName, otp } = req.body;

  try {
    // Send OTP email
    const result = await emailService.sendEmail(email, user.name, otp);

    // Simple check - if we get a result and first element has statusCode 202, it's success
    if (result && result[0] && result[0].statusCode === 202) {
      return res.status(200).json({ message: "OTP email sent successfully!" });
    } else {
      throw new Error("Failed to send email");
    }

    if (result) {
      return res.status(200).json({ message: "OTP email sent successfully!" });
    } else {
      return res.status(500).json({ message: "Failed to send OTP email." });
    }
  } catch (error) {
    console.error("Error in /send-reset-otp route:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while sending the email." });
  }
});

// --- Job Routes ---
app.get("/api/jobs", async (req, res) => {
  try {
    const jobs = await Job.find({}).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching jobs." });
  }
});

// --- Candidate Routes ---
app.get("/api/candidates", async (req, res) => {
  try {
    const topCandidates = await Candidate.find({}).sort({ match: -1 }).limit(5);
    res.json(topCandidates);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching candidates." });
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

// const express = require('express');
// const { OpenAI } = require('openai');

// const router = express.Router();

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY
// });

// router.post('/chat', async (req, res) => {
//   try {
//     const { message } = req.body;

//     const response = await openai.chat.completions.create({
//       model: "gpt-4", // or "gpt-3.5-turbo"
//       messages: [{ role: "user", content: message }]
//     });

//     res.json({ reply: response.choices[0].message.content });
//   } catch (err) {
//     console.error("OpenAI error:", err);
//     res.status(500).json({ error: "OpenAI API request failed" });
//   }
// });

// module.exports = router;

// const chatRoute = require('./routes/api'); // Adjust path
// app.use('/api', chatRoute);
