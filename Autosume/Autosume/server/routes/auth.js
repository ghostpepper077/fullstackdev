const express = require("express");
const bcrypt = require("bcryptjs");
const jwt =require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middlewares/auth"); // <-- Correct path with an "s"

const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    user = new User({ username, email, password });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Login a user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const payload = { user: { id: user.id } };
    const token = jwt.sign(
        payload, 
        process.env.APP_SECRET, 
        { expiresIn: process.env.TOKEN_EXPIRES_IN }
    );
    
    // **FIX:** Return both the token AND the user's data (without the password)
    res.json({ 
        token, 
        user: { id: user.id, username: user.username, email: user.email }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// **ADD THIS NEW ROUTE:** Get logged-in user's profile
router.get("/profile", auth, async (req, res) => {
    res.json(req.user);
});


module.exports = router;