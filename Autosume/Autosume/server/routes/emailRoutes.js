const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');

// Route to send OTP email
router.post('/send-reset-otp', async (req, res) => {
  const { email, name, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required.' });
  }

  try {
    // FIX: Use emailService.sendEmail instead of just sendEmail
    const result = await emailService.sendEmail(email, name || 'User', otp);
    
    // Check SendGrid response
    if (result && result[0] && result[0].statusCode === 202) {
      return res.status(200).json({ message: 'OTP email sent successfully.' });
    } else {
      return res.status(500).json({ message: 'Failed to send email.' });
    }
  } catch (error) {
    console.error('Email route error:', error);
    return res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

module.exports = router;