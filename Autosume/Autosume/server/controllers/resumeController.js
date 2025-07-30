const { OpenAI } = require('openai');
const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const Job = require('../models/jobs'); // Adjust path if needed

// Maximum allowed PDF size (5MB)
const MAX_PDF_SIZE = 5 * 1024 * 1024;

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

    // New prompt: extract ALL candidates from the resume
    const prompt = `
Extract ALL candidate profiles from the resume text below. Respond ONLY with valid JSON in this format:
{
  "candidates": [
    {
      "name": "full name of candidate",
      "email": "email address",
      "phone": "phone number",
      "skills": ["array", "of", "technical", "skills"],
      "experience": "years of experience as number",
      "education": "education details",
      "summary": "2-3 sentence professional summary"
    },
    ...
  ]
}

Resume Text:
${pdfText.text.substring(0, 6000)}
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500
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
- Experience: ${cand.experience || 'Unknown'} years
${cand.summary ? `- Summary: ${cand.summary}` : ''}

JOB REQUIREMENTS:
- Required Skills: ${criteria.skills.join(', ')}
- Required Experience: ${criteria.experience} years

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
        experience: cand.experience || '',
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