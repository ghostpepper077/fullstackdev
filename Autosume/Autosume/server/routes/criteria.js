const express = require('express');
const router = express.Router();
const Criteria = require('../models/Criteria');
const Job = require('../models/jobs');

// Enhanced GET all criteria with filtering
router.get('/', async (req, res) => {
  try {
    const { role, experience, skill } = req.query;
    const filter = {};
    
    if (role) filter['jobId.role'] = new RegExp(role, 'i');
    if (experience) filter.experience = experience;
    if (skill) filter.skills = { $in: [new RegExp(skill, 'i')] };

    const criteriaList = await Criteria.find(filter)
      .populate('jobId', 'role')
      .sort({ createdAt: -1 });
      
    res.json(criteriaList);
  } catch (error) {
    console.error("Error fetching criteria:", error);
    res.status(500).json({ message: 'Server error while fetching criteria.' });
  }
});

// Unified criteria creation/update
router.post('/', async (req, res) => {
  try {
    const { jobId, experience, skills, action } = req.body;
    
    if (action === 'update' && req.body.id) {
      // Update existing criteria
      const skillsArray = skills.split(',').map(skill => skill.trim());
      const updated = await Criteria.findByIdAndUpdate(
        req.body.id,
        { jobId, experience, skills: skillsArray },
        { new: true }
      );
      return res.json(updated);
    } else {
      // Create new criteria
      if (!jobId || !experience || !skills) {
        return res.status(400).json({ message: 'Missing required fields.' });
      }
      const skillsArray = skills.split(',').map(skill => skill.trim());
      const newCriteria = new Criteria({ jobId, experience, skills: skillsArray });
      await newCriteria.save();
      res.status(201).json(newCriteria);
    }
  } catch (error) {
    console.error("Error saving criteria:", error);
    res.status(500).json({ message: 'Server error while saving criteria.' });
  }
});

// Enhanced filter options endpoint
router.get('/options', async (req, res) => {
  try {
    const [experienceOptions, skillsOptions, jobOptions] = await Promise.all([
      Criteria.distinct('experience'),
      Criteria.aggregate([
        { $unwind: '$skills' },
        { $group: { _id: '$skills' } },
        { $sort: { _id: 1 } }
      ]).then(results => results.map(r => r._id)),
      Job.find({}).select('role _id').sort({ role: 1 })
    ]);
    
    res.json({ 
      experience: experienceOptions, 
      skills: skillsOptions, 
      jobs: jobOptions 
    });
  } catch (error) {
    console.error("Error fetching options:", error);
    res.status(500).json({ message: 'Server error while fetching options.' });
  }
});

// Batch delete endpoint
router.delete('/batch', async (req, res) => {
  try {
    const { ids } = req.body;
    await Criteria.deleteMany({ _id: { $in: ids } });
    res.json({ message: `${ids.length} criteria deleted successfully.` });
  } catch (error) {
    console.error("Error deleting criteria:", error);
    res.status(500).json({ message: 'Server error while deleting criteria.' });
  }
});

module.exports = router;