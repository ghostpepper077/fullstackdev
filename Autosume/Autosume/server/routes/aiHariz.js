const express = require('express');
const router = express.Router();
const multer = require('multer');
const resumeController = require('../controllers/resumeController');

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Resume processing route
router.post('/process-resume', upload.single('resume'), resumeController.processResume);

// Screening route
router.post('/screen', resumeController.screenCandidate);

module.exports = router;