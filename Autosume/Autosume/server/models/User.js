const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: { type: String, default: "user" },
  lastLogin: { type: Date },
  isActive: { type: Boolean, default: true },
  dateOfBirth: { type: String },
  gender: { type: String },
  country: { type: String },
  language: { type: String },
  timeZone: { type: String },
  // OTP fields for password reset
  resetPasswordOTP: { type: String },
  resetPasswordOTPExpires: { type: Date },
  resetPasswordOTPVerified: { type: Boolean, default: false }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate OTP method
userSchema.methods.generateResetPasswordOTP = function() {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  this.resetPasswordOTP = otp;
  this.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  this.resetPasswordOTPVerified = false;
  
  return otp;
};

// Verify OTP method
userSchema.methods.verifyResetPasswordOTP = function(otp) {
  return (
    this.resetPasswordOTP === otp &&
    this.resetPasswordOTPExpires > Date.now()
  );
};

// Clear OTP method
userSchema.methods.clearResetPasswordOTP = function() {
  this.resetPasswordOTP = undefined;
  this.resetPasswordOTPExpires = undefined;
  this.resetPasswordOTPVerified = false;
};

module.exports = mongoose.model('User', userSchema);