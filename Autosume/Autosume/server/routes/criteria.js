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
    let skillsArray;
    if (Array.isArray(skills)) {
      skillsArray = skills.map(skill => skill.trim());
    } else if (typeof skills === 'string') {
      skillsArray = skills.split(',').map(skill => skill.trim());
    } else {
      skillsArray = [];
    }
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
        let skillsArray;
        if (Array.isArray(skills)) {
          skillsArray = skills.map(skill => skill.trim());
        } else if (typeof skills === 'string') {
          skillsArray = skills.split(',').map(skill => skill.trim());
        } else {
          skillsArray = [];
        }
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


// Add to criteria.js

const { OpenAI } = require('openai');
const openai = new OpenAI(process.env.OPENAI_API_KEY);

// AI Screening Endpoint
router.post('/screening', async (req, res) => {
  try {
    const { jobId, resumeText } = req.body;
    
    // Validate input
    if (!jobId || !resumeText) {
      return res.status(400).json({ message: 'Missing jobId or resumeText' });
    }

    // Get the criteria for this job
    const criteria = await Criteria.findOne({ jobId }).populate('jobId', 'role');
    if (!criteria) {
      return res.status(404).json({ message: 'No criteria found for this job' });
    }

    // Prepare the AI prompt with structured instructions
    const prompt = `
      Analyze this resume against the specific job requirements. Provide a detailed assessment:

      Job Requirements:
      - Role: ${criteria.jobId.role}
      - Required Experience: ${criteria.experience}
      - Required Skills: ${criteria.skills.join(', ')}

      Resume Content:
      ${resumeText}

      Provide your assessment in this exact JSON format:
      {
        "matchPercentage": number (0-100),
        "matchingSkills": string[],
        "missingSkills": string[],
        "experienceMatch": "under"|"meets"|"exceeds",
        "summary": string (3-4 sentences),
        "recommendation": "strong-match"|"potential-match"|"weak-match"
      }

      Key Analysis Guidelines:
      1. Match skills case-insensitively
      2. Consider partial skill matches (e.g. "React.js" matches "React")
      3. Evaluate experience based on years mentioned
      4. Be strict but fair in assessment
    `;

    // Call OpenAI API with structured response
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2, // Lower for more consistent results
      response_format: { type: "json_object" } // Ensure JSON response
    });

    // Parse and validate the AI response
    let aiResults;
    try {
      aiResults = JSON.parse(response.choices[0].message.content);
      
      // Validate required fields
      if (!aiResults.matchPercentage || !aiResults.matchingSkills) {
        throw new Error('Invalid AI response format');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return res.status(500).json({ message: 'Failed to process AI response' });
    }

    // Format the response with additional metadata
    const result = {
      job: criteria.jobId.role,
      criteria: {
        experience: criteria.experience,
        requiredSkills: criteria.skills
      },
      analysis: aiResults,
      resumeHighlights: extractResumeHighlights(resumeText) // New helper function
    };

    res.json(result);
    
  } catch (error) {
    console.error("AI screening error:", error);
    res.status(500).json({ 
      message: 'AI screening failed',
      error: error.message,
      suggestion: 'Please check the resume format and try again'
    });
  }
});

// Helper function to extract key resume sections
function extractResumeHighlights(resumeText) {
  const highlights = {
    experience: [],
    skills: [],
    education: []
  };

  // Simple extraction logic (can be enhanced)
  const lines = resumeText.split('\n');
  let currentSection = null;

  lines.forEach(line => {
    if (line.match(/experience/i)) {
      currentSection = 'experience';
    } else if (line.match(/skills|technologies/i)) {
      currentSection = 'skills';
    } else if (line.match(/education/i)) {
      currentSection = 'education';
    } else if (currentSection && line.trim()) {
      highlights[currentSection].push(line.trim());
    }
  });

  return highlights;
}
module.exports = router;