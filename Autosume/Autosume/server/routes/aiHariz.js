const express = require('express');
const router = express.Router();
const multer = require('multer');
const resumeController = require('../controllers/resumeController');
const screenedCandidatesController = require('../controllers/screenedCandidatesController');

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Resume processing routes
router.post('/process-resume', upload.single('resume'), resumeController.processResume);
router.post('/screen', resumeController.screenCandidate);

// Candidate management routes
router.post('/candidates/bulk', resumeController.saveCandidates);
router.get('/candidates', resumeController.getCandidates);

// Screened candidates routes
router.post('/screened-candidates', screenedCandidatesController.saveScreenedCandidates);
router.get('/screened-candidates', screenedCandidatesController.getScreenedCandidates);

module.exports = router;