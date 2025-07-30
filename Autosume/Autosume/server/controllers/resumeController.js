const { OpenAI } = require('openai');
const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const Job = require('../models/jobs'); // Adjust path if needed

// Maximum allowed PDF size (5MB)
const MAX_PDF_SIZE = 5 * 1024 * 1024;

// Helper function to format experience with "years"
const formatExperience = (experience) => {
  if (!experience) return '';
  
  // If it's already a string with "years", return as is
  if (typeof experience === 'string' && experience.toLowerCase().includes('year')) {
    return experience;
  }
  
  // If it's a number or string number, add "years"
  const num = typeof experience === 'number' ? experience : parseInt(experience);
  if (!isNaN(num)) {
    return num === 1 ? `${num} year` : `${num} years`;
  }
  
  // If it's a string but not a number, return as is
  return experience.toString();
};

// Process Resume Function
exports.processResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      error: "No file uploaded",
      details: "Please select a PDF file"
    });
  }

  try {
    console.log(`Processing file: ${req.file.originalname}`);
    
    // 1. Validate file type and size
    if (!req.file.mimetype.includes('pdf')) {
      throw new Error("Only PDF files are accepted");
    }

    if (req.file.size > MAX_PDF_SIZE) {
      throw new Error("File size exceeds 5MB limit");
    }

    // 2. Read and parse PDF
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfText = await pdf(dataBuffer);
    
    if (!pdfText.text || pdfText.text.length < 50) {
      throw new Error("PDF contains no readable text");
    }

    // 3. Process with OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Updated prompt to ensure consistent experience format
    const prompt = `
Extract ALL candidate profiles from the resume text below. Respond ONLY with valid JSON in this format:
{
  "candidates": [
    {
      "name": "full name",
      "email": "email",
      "phone": "phone",
      "skills": ["array", "of", "skills"],
      "experience": "number (just the number of years, e.g., 3 not '3 years')",
      "education": "education",
      "summary": "2-3 sentence summary"
    }
  ]
}

Important Rules:
1. Include ALL candidates found in the resume
2. For experience, provide ONLY the number (e.g., 3, not "3 years")
3. If the list is truncated, you MUST continue from where you left off
4. Never omit candidates due to length

Resume Text:
${pdfText.text.substring(0, 20000)}
    `.trim();
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 4000  // Increase token limit
    });

    // 4. Validate and format response
    let result;
    try {
      result = JSON.parse(completion.choices[0].message.content);
    } catch (parseError) {
      console.error("Error parsing OpenAI response as JSON:", parseError);
      console.error("OpenAI raw response:", completion.choices[0].message.content);
      return res.status(500).json({
        error: "Invalid JSON response from AI",
        rawResponse: completion.choices[0].message.content
      });
    }

    if (!result.candidates || !Array.isArray(result.candidates) || result.candidates.length === 0) {
      throw new Error("AI did not return any candidates");
    }

    // Format experience for all candidates
    result.candidates = result.candidates.map(candidate => ({
      ...candidate,
      experience: formatExperience(candidate.experience)
    }));

    // Optionally, add top-level preview fields for first candidate
    const first = result.candidates[0];
    res.json({
      success: true,
      data: {
        candidates: result.candidates,
        name: first?.name || "",
        email: first?.email || "",
        phone: first?.phone || "",
        skills: first?.skills || [],
        experience: first?.experience || "",
        education: first?.education || "",
        summary: first?.summary || ""
      }
    });

  } catch (error) {
    console.error("Processing error:", error);
    if (error.response) {
      // If error from axios or OpenAI API
      console.error("Error response data:", error.response.data);
    }
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
    res.status(500).json({
      error: "Resume processing failed",
      details: error.message || error.toString(),
      suggestion: "Try a different PDF file or check server logs"
    });
  } finally {
    // Clean up uploaded file
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error("Error deleting uploaded file:", unlinkError);
      }
    }
  }
};

// Screen Candidate Function
exports.screenCandidate = async (req, res) => {
  try {

    let candidates = req.body.candidates;
    // If not provided, fallback to single candidate from request
    if (!Array.isArray(candidates)) {
      candidates = [{
        name: req.body.name || '',
        skills: req.body.skills || [],
        experience: req.body.experience || '',
        email: req.body.email || '',
        phone: req.body.phone || '',
        education: req.body.education || '',
        summary: req.body.summary || ''
      }];
    }

    // Import Criteria model
    const Criteria = require('../models/Criteria');
    const criteria = await Criteria.findOne({ jobId: req.body.jobId }).populate('jobId');
    if (!criteria) {
      return res.status(404).json({ error: 'Criteria not found for this job' });
    }

    // Initialize OpenAI
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Screen all candidates
    const results = [];
    const CandidateModel = require('../models/Candidate');
    for (const cand of candidates) {
      const prompt = `
STRICTLY analyze this candidate for ${criteria.jobId.role} role and ONLY respond with the following JSON format:

{
  "matchPercentage": numberBetween50And100,
  "matchedSkills": ["only","matching","skills"],
  "missingSkills": ["only","missing","skills"],
  "strengths": ["concise","strengths"],
  "weaknesses": ["concise","weaknesses"],
  "recommendation": "one sentence recommendation",
  "name": "${cand.name}"
}

CANDIDATE PROFILE:
- Skills: ${Array.isArray(cand.skills) ? cand.skills.join(', ') : cand.skills || 'None'}
- Experience: ${cand.experience || 'Unknown'}
${cand.summary ? `- Summary: ${cand.summary}` : ''}

JOB REQUIREMENTS:
- Required Skills: ${criteria.skills.join(', ')}
- Required Experience: ${criteria.experience}

RULES:
1. matchPercentage MUST be between 50-100 based on skill/experience match
2. ONLY include skills that actually appear in both candidate and job
3. NEVER add any text outside the JSON object
`.trim();

      let result;
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3
        });
        result = JSON.parse(completion.choices[0].message.content);
      } catch (parseError) {
        console.error("Error parsing AI screening response as JSON:", parseError);
        continue;
      }
      // Ensure matchPercentage is a number and fallback to 50 if missing or invalid
      let matchValue = 50;
      if (typeof result.matchPercentage === 'number' && !isNaN(result.matchPercentage)) {
        matchValue = result.matchPercentage;
      } else if (typeof result.matchPercentage === 'string') {
        const parsed = parseInt(result.matchPercentage, 10);
        matchValue = (!isNaN(parsed) && parsed >= 50 && parsed <= 100) ? parsed : 50;
      }
      // Fallback for matchedSkills
      let matchedSkills = Array.isArray(result.matchedSkills) ? result.matchedSkills : [];
      if (matchedSkills.length === 0 && Array.isArray(result.skills)) {
        matchedSkills = result.skills;
      } else if (matchedSkills.length === 0 && Array.isArray(cand.skills)) {
        matchedSkills = cand.skills;
      }
      
      const candidateDoc = {
        name: cand.name || result.name || '',
        email: cand.email || '',
        phone: cand.phone || '',
        education: cand.education || '',
        summary: cand.summary || result.recommendation || '',
        match: matchValue,
        skills: matchedSkills,
        missingSkills: Array.isArray(result.missingSkills) ? result.missingSkills : [],
        strengths: Array.isArray(result.strengths) ? result.strengths : [],
        weaknesses: Array.isArray(result.weaknesses) ? result.weaknesses : [],
        recommendation: result.recommendation,
        matchPercentage: matchValue,
        experience: formatExperience(cand.experience), // Format experience here
        role: criteria.jobId.role || '',
        aiSummary: result.recommendation || '',
        experienceDetails: cand.experienceDetails || '',
        educationDetails: cand.education || ''
      };
      // Save or update candidate in DB (upsert by email+role)
      await CandidateModel.findOneAndUpdate(
        { email: candidateDoc.email, role: candidateDoc.role },
        candidateDoc,
        { upsert: true, new: true }
      );
      results.push(candidateDoc);
    }

    // Sort results by matchPercentage descending
    results.sort((a, b) => (b.match || 0) - (a.match || 0));

    res.json({ success: true, results });

  } catch (error) {
    console.error('Screening error:', error);
    if (error.response) {
      console.error("Error response data:", error.response.data);
    }
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
    res.status(500).json({
      error: 'Screening failed',
      details: error.message || error.toString()
    });
  }
};

// Add this new function to resumeController.js
exports.saveCandidates = async (req, res) => {
  try {
    const CandidateModel = require('../models/Candidate');
    const candidates = req.body.candidates || [];
    
    if (!Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({ error: "No candidates provided" });
    }

    // 1. First remove duplicates by email (in-memory) and format experience
    const uniqueCandidates = candidates.reduce((acc, current) => {
      const exists = acc.some(item => item.email === current.email && item.role === current.role);
      if (!exists) {
        // Format experience before saving
        const formattedCandidate = {
          ...current,
          experience: formatExperience(current.experience)
        };
        acc.push(formattedCandidate);
      }
      return acc;
    }, []);

    // 2. Bulk upsert operation (atomic)
    const bulkOps = uniqueCandidates.map(candidate => ({
      updateOne: {
        filter: { email: candidate.email, role: candidate.role },
        update: { $set: candidate },
        upsert: true
      }
    }));

    const result = await CandidateModel.bulkWrite(bulkOps);
    
    res.json({
      success: true,
      inserted: result.upsertedCount,
      updated: result.modifiedCount,
      total: result.upsertedCount + result.modifiedCount
    });
  } catch (error) {
    console.error('Error saving candidates:', error);
    res.status(500).json({
      error: 'Failed to save candidates',
      details: error.message,
      suggestion: 'Check for duplicate emails or invalid data'
    });
  }
};

// Add this to your controller
exports.getCandidates = async (req, res) => {
  try {
    const CandidateModel = require('../models/Candidate');
    const { jobRole, experience, skills } = req.query;
    
    const query = {};
    if (jobRole) query.role = jobRole;
    if (experience) query.experience = experience;
    if (skills) query.skills = { $in: [skills] };

    const candidates = await CandidateModel.find(query).sort({ match: -1 });
    
    res.json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({
      error: 'Failed to fetch candidates',
      details: error.message
    });
  }
};