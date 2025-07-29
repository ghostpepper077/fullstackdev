const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const { authenticateToken } = require("../middlewares/auth");
const { sendOTPEmail } = require("../services/emailService");

// JWT Secrets
const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.APP_SECRET ||
  "your-super-secret-jwt-key";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "your-super-secret-refresh-key";

// Helper function to generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: process.env.TOKEN_EXPIRES_IN || "15m",
  });

  const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

// Register endpoint
router.post(
  "/register",
  [
    body("name")
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage("Name must be between 3 and 50 characters")
      .matches(/^[a-zA-Z '-,.]+$/)
      .withMessage("Name only allow letters, spaces and characters: ' - , ."),
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please enter a valid email")
      .isLength({ max: 50 })
      .withMessage("Email must be at most 50 characters")
      .normalizeEmail(),
    body("password")
      .trim()
      .isLength({ min: 8, max: 50 })
      .withMessage("Password must be between 8 and 50 characters")
      .matches(/^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/)
      .withMessage("Password must contain at least 1 letter and 1 number"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({
          message: "User with this email already exists",
        });
      }

      // Create new user
      const user = new User({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      await user.save();

      res.status(201).json({
        message: `Email ${user.email} was registered successfully.`,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);

      if (error.code === 11000) {
        return res.status(409).json({
          message: "Email already exists.",
        });
      }

      if (error.name === "ValidationError") {
        const validationErrors = Object.values(error.errors).map(
          (err) => err.message
        );
        return res.status(400).json({
          message: "Validation failed",
          errors: validationErrors,
        });
      }

      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
);

// Login endpoint
router.post(
  "/login",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail(),
    body("password").trim().notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Invalid input data",
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({
        email: email.toLowerCase(),
        isActive: true,
      });

      if (!user) {
        return res.status(401).json({
          message: "Email or password is not correct.",
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          message: "Email or password is not correct.",
        });
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user._id);

      // Update user's last login
      user.lastLogin = new Date();
      await user.save();

      // Return user info (legacy format for compatibility)
      const userInfo = {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        lastLogin: user.lastLogin,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        country: user.country,
        language: user.language,
        timeZone: user.timeZone,
      };

      res.status(200).json({
        message: "Login successful",
        accessToken,
        refreshToken,
        user: userInfo,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
);

// Send OTP for password reset
router.post(
  "/send-reset-otp",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Invalid email format",
          errors: errors.array(),
        });
      }

      const { email } = req.body;

      // Find user by email
      const user = await User.findOne({
        email: email.toLowerCase(),
        isActive: true,
      });

      if (!user) {
        return res.status(404).json({
          message: "No account found with this email address",
        });
      }

      // Generate OTP
      const otp = user.generateResetPasswordOTP();
      await user.save();

      // Send OTP email
      const emailResult = await sendOTPEmail(user.email, otp, user.name);

      if (!emailResult.success) {
        return res.status(500).json({
          message: "Failed to send verification email. Please try again.",
        });
      }

      res.status(200).json({
        message: "Verification code sent to your email",
        email: user.email,
      });
    } catch (error) {
      console.error("Send OTP error:", error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
);

// Verify OTP for password reset
router.post(
  "/verify-reset-otp",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail(),
    body("otp")
      .trim()
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be 6 digits")
      .isNumeric()
      .withMessage("OTP must contain only numbers"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email, otp } = req.body;

      // Find user by email
      const user = await User.findOne({
        email: email.toLowerCase(),
        isActive: true,
      });

      if (!user) {
        return res.status(404).json({
          message: "No account found with this email address",
        });
      }

      // Verify OTP
      if (!user.verifyResetPasswordOTP(otp)) {
        return res.status(400).json({
          message: "Invalid or expired verification code",
        });
      }

      // Mark OTP as verified
      user.resetPasswordOTPVerified = true;
      await user.save();

      res.status(200).json({
        message: "Verification code verified successfully",
        email: user.email,
      });
    } catch (error) {
      console.error("Verify OTP error:", error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
);

// Reset password endpoint (now requires verified OTP)
router.put("/reset-password",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail(),
    body("password")
      .trim()
      .isLength({ min: 8, max: 50 })
      .withMessage("Password must be between 8 and 50 characters")
      .matches(/^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/)
      .withMessage("Password must contain at least 1 letter and 1 number"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({
        email: email.toLowerCase(),
        isActive: true,
      });

      if (!user) {
        return res.status(404).json({
          message: "No account found with this email address",
        });
      }

      // Check if OTP was verified
      if (!user.resetPasswordOTPVerified) {
        return res.status(400).json({
          message: "Please verify your email with the OTP first",
        });
      }

      // Check if OTP is still valid (hasn't expired)
      if (user.resetPasswordOTPExpires < Date.now()) {
        return res.status(400).json({
          message: "Verification code has expired. Please request a new one.",
        });
      }

      // Update password (will be hashed by pre-save hook)
      user.password = password.trim();
      
      // Clear OTP data
      user.clearResetPasswordOTP();
      
      await user.save();

      res.status(200).json({
        message: "Password reset successfully",
        email: user.email,
      });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
);

// Legacy endpoint - keeping for backward compatibility but now sends OTP
router.post(
  "/verify-email",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Invalid email format",
          errors: errors.array(),
        });
      }

      const { email } = req.body;

      // Find user by email
      const user = await User.findOne({
        email: email.toLowerCase(),
        isActive: true,
      });

      if (!user) {
        return res.status(404).json({
          message: "No account found with this email address",
        });
      }

      // Generate OTP
      const otp = user.generateResetPasswordOTP();
      await user.save();

      // Send OTP email
      const emailResult = await sendOTPEmail(user.email, otp, user.name);

      if (!emailResult.success) {
        return res.status(500).json({
          message: "Failed to send verification email. Please try again.",
        });
      }

      res.status(200).json({
        message: "Verification code sent to your email",
        email: user.email,
      });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
);

// Get authenticated user info
router.get("/auth", authenticateToken, (req, res) => {
  const userInfo = {
  id: req.user._id,
  email: req.user.email,
  name: req.user.name,
  role: req.user.role,
  lastLogin: req.user.lastLogin,
  dateOfBirth: req.user.dateOfBirth,
  gender: req.user.gender,
  country: req.user.country,
  language: req.user.language,
  timeZone: req.user.timeZone,
};
  res.json({ user: userInfo });
});

// Get user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    res.status(200).json({
      message: "Profile retrieved successfully",
      user: req.user,
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

// Update user profile
router.put(
  "/profile",
  authenticateToken,
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage("Name must be between 3 and 50 characters")
      .matches(/^[a-zA-Z '-,.]+$/)
      .withMessage("Name only allow letters, spaces and characters: ' - , ."),
    body("email")
      .optional()
      .trim()
      .isEmail()
      .withMessage("Please enter a valid email")
      .isLength({ max: 50 })
      .withMessage("Email must be at most 50 characters"),
    body("password")
      .optional()
      .trim()
      .isLength({ min: 8, max: 50 })
      .withMessage("Password must be between 8 and 50 characters")
      .matches(/^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/)
      .withMessage("Password must contain at least 1 letter and 1 number"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const {
        name,
        email,
        password,
        dateOfBirth,
        gender,
        country,
        language,
        timeZone,
      } = req.body;
      const user = req.user;

      // Update fields if provided
      if (name) user.name = name.trim();
      if (email) user.email = email.trim().toLowerCase();
      if (password) user.password = password.trim(); // Will be hashed by pre-save hook
      if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
      if (gender !== undefined) user.gender = gender;
      if (country !== undefined) user.country = country;
      if (language !== undefined) user.language = language;
      if (timeZone !== undefined) user.timeZone = timeZone;

      await user.save();

      // Generate new token with updated user data
      const userInfo = {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        lastLogin: user.lastLogin,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        country: user.country,
        language: user.language,
        timeZone: user.timeZone,
      };

      const newAccessToken = jwt.sign(userInfo, JWT_SECRET, {
        expiresIn: process.env.TOKEN_EXPIRES_IN || "15m",
      });

      res.status(200).json({
        message: "Profile updated successfully.",
        accessToken: newAccessToken,
        user: userInfo,
      });
    } catch (error) {
      console.error("Profile update error:", error);

      if (error.code === 11000) {
        return res.status(409).json({
          message: "Email already exists.",
        });
      }

      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
);

// Token refresh endpoint
router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token is required",
      });
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    const tokens = generateTokens(user._id);

    res.status(200).json({
      message: "Token refreshed successfully",
      ...tokens,
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(401).json({
      message: "Invalid refresh token",
    });
  }
});

// Logout endpoint
router.post("/logout", (req, res) => {
  res.status(200).json({
    message: "Logout successful",
  });
});

module.exports = router;