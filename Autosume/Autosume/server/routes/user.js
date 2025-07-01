const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { User } = require("../models");
const yup = require("yup");
const { sign } = require("jsonwebtoken");
const { validateToken } = require("../middlewares/auth");
require("dotenv").config();

router.post("/register", async (req, res) => {
  let data = req.body;
  // Validate request body
  let validationSchema = yup.object({
    name: yup
      .string()
      .trim()
      .min(3)
      .max(50)
      .required()
      .matches(
        /^[a-zA-Z '-,.]+$/,
        "name only allow letters, spaces and characters: ' - , ."
      ),
    email: yup.string().trim().lowercase().email().max(50).required(),
    password: yup
      .string()
      .trim()
      .min(8)
      .max(50)
      .required()
      .matches(
        /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/,
        "password at least 1 letter and 1 number"
      ),
  });
  try {
    data = await validationSchema.validate(data, { abortEarly: false });

    // Check email
    let user = await User.findOne({
      where: { email: data.email },
    });
    if (user) {
      res.status(400).json({ message: "Email already exists." });
      return;
    }

    // Hash passowrd
    data.password = await bcrypt.hash(data.password, 10);
    // Create user
    let result = await User.create(data);
    res.json({
      message: `Email ${result.email} was registered successfully.`,
    });
  } catch (err) {
    res.status(400).json({ errors: err.errors });
  }
});

router.post("/login", async (req, res) => {
  let data = req.body;
  // Validate request body
  let validationSchema = yup.object({
    email: yup.string().trim().lowercase().email().max(50).required(),
    password: yup.string().trim().min(8).max(50).required(),
  });
  try {
    data = await validationSchema.validate(data, { abortEarly: false });

    // Check email and password
    let errorMsg = "Email or password is not correct.";
    let user = await User.findOne({
      where: { email: data.email },
    });
    if (!user) {
      res.status(400).json({ message: errorMsg });
      return;
    }
    let match = await bcrypt.compare(data.password, user.password);
    if (!match) {
      res.status(400).json({ message: errorMsg });
      return;
    }

    // Return user info
    let userInfo = {
      id: user.id,
      email: user.email,
      name: user.name,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      country: user.country,
      language: user.language,
      timeZone: user.timeZone,
    };
    let accessToken = sign(userInfo, process.env.APP_SECRET, {
      expiresIn: process.env.TOKEN_EXPIRES_IN,
    });
    res.json({
      accessToken: accessToken,
      user: userInfo,
    });
  } catch (err) {
    res.status(400).json({ errors: err.errors });
    return;
  }
});

router.get("/auth", validateToken, (req, res) => {
  res.json({ user: req.user });
});

// PUT /user/profile - update user profile
router.put("/profile", validateToken, async (req, res) => {
  const userId = req.user.id;
  const data = req.body;

  // Validation schema for profile update
  let validationSchema = yup.object({
    name: yup.string().trim().min(3).max(50).required(),
    email: yup.string().trim().lowercase().email().max(50).required(),
    dateOfBirth: yup.string().nullable(),
    gender: yup.string().nullable(),
    country: yup.string().nullable(),
    language: yup.string().nullable(),
    timeZone: yup.string().nullable(),
    password: yup
      .string()
      .trim()
      .min(8)
      .max(50)
      .matches(
        /^(|(?=.*[a-zA-Z])(?=.*[0-9]).{8,})$/,
        "Password must have at least 1 letter and 1 number"
      )
      .notRequired(),
  });

  try {
    const validated = await validationSchema.validate(data, {
      abortEarly: false,
    });

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update fields
    user.name = validated.name;
    user.email = validated.email;
    user.dateOfBirth = validated.dateOfBirth;
    user.gender = validated.gender;
    user.country = validated.country;
    user.language = validated.language;
    user.timeZone = validated.timeZone;

    // If password is provided, hash and update
    if (validated.password) {
      user.password = await bcrypt.hash(validated.password, 10);
    }

    await user.save();

    // CREATE NEW JWT TOKEN WITH UPDATED USER DATA
    let updatedUserInfo = {
      id: user.id,
      email: user.email,
      name: user.name,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      country: user.country,
      language: user.language,
      timeZone: user.timeZone,
    };

    let newAccessToken = sign(updatedUserInfo, process.env.APP_SECRET, {
      expiresIn: process.env.TOKEN_EXPIRES_IN,
    });

    res.json({
      message: "Profile updated successfully.",
      accessToken: newAccessToken, // Return new token
      user: updatedUserInfo, // Return updated user data
    });
  } catch (err) {
    if (err.errors) {
      res.status(400).json({ errors: err.errors });
    } else {
      res.status(500).json({ message: "Server error." });
    }
  }
});

module.exports = router;
