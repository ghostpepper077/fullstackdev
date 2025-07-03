const express = require('express');
const router = express.Router();
const Criteria = require('../models/Criteria');
const Job = require('../models/jobs');

// GET all criteria => handles GET /api/criteria
router.get('/', async (req, res) => {
  try {
    const criteriaList = await Criteria.find({}).populate('jobId', 'role').sort({ createdAt: -1 });
    res.json(criteriaList);
  } catch (error) {
    console.error("Error in GET /api/criteria:", error);
    res.status(500).json({ message: 'Server error while fetching criteria.' });
  }
});

// POST a new criterion => handles POST /api/criteria
router.post('/', async (req, res) => {
  try {
    const { jobId, experience, skills } = req.body;
    if (!jobId || !experience || !skills) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }
    const skillsArray = skills.split(',').map(skill => skill.trim());
    const newCriteria = new Criteria({ jobId, experience, skills: skillsArray });
    await newCriteria.save();
    res.status(201).json(newCriteria);
  } catch (error) {
    console.error("Error in POST /api/criteria:", error);
    res.status(500).json({ message: 'Server error while creating criteria.' });
  }
});

// GET unique filter options => handles GET /api/criteria/options
router.get('/options', async (req, res) => {
    try {
        const [experienceOptions, skillsOptions, jobOptions] = await Promise.all([
            Criteria.distinct('experience'),
            Criteria.distinct('skills'),
            Job.find({}).select('role').sort({ role: 1 })
        ]);
        res.json({ experience: experienceOptions, skills: skillsOptions, jobs: jobOptions });
    } catch (error) {
        console.error("Error in GET /api/criteria/options:", error);
        res.status(500).json({ message: 'Server error while fetching options.' });
    }
});

// PUT (update) a criterion by ID => handles PUT /api/criteria/:id
router.put('/:id', async (req, res) => {
    try {
        const { jobId, experience, skills } = req.body;
        const skillsArray = skills.split(',').map(skill => skill.trim());
        const updatedCriteria = await Criteria.findByIdAndUpdate(
            req.params.id,
            { jobId, experience, skills: skillsArray },
            { new: true }
        );
        if (!updatedCriteria) return res.status(404).json({ message: 'Criteria not found.' });
        res.json(updatedCriteria);
    } catch (error) {
        console.error("Error in PUT /api/criteria/:id:", error);
        res.status(500).json({ message: 'Server error while updating criteria.' });
    }
});

// DELETE a criterion by ID => handles DELETE /api/criteria/:id
router.delete('/:id', async (req, res) => {
    try {
        const deletedCriteria = await Criteria.findByIdAndDelete(req.params.id);
        if (!deletedCriteria) return res.status(404).json({ message: 'Criteria not found.' });
        res.json({ message: 'Criteria deleted successfully.' });
    } catch (error) {
        console.error("Error in DELETE /api/criteria/:id:", error);
        res.status(500).json({ message: 'Server error while deleting criteria.' });
    }
});

module.exports = router;