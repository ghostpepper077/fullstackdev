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

    const prompt = `
Extract the following fields from the resume below and respond ONLY with valid JSON in this format:
{
  "name": "full name of candidate",
  "email": "email address",
  "phone": "phone number",
  "skills": ["array", "of", "technical", "skills"],
  "experience": "years of experience as number",
  "education": "education details",
  "summary": "2-3 sentence professional summary"
}

Resume Text:
${pdfText.text.substring(0, 3000)}
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500
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

    if (!result.skills || !result.experience) {
      throw new Error("AI returned incomplete data");
    }

    res.json({
      success: true,
      data: {
        name: result.name || "",
        email: result.email || "",
        phone: result.phone || "",
        skills: result.skills,
        experience: result.experience,
        education: result.education || "",
        summary: result.summary || ""
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
    for (const cand of candidates) {
      const prompt = `
Analyze how well this candidate matches the ${criteria.jobId.role} position:

Candidate Name: ${cand.name}
Candidate Skills: ${Array.isArray(cand.skills) ? cand.skills.join(', ') : cand.skills}
Candidate Experience: ${cand.experience} years

Job Criteria:
Required Experience: ${criteria.experience}
Required Skills: ${criteria.skills.join(', ')}

Return a JSON response with:
{
  "matchPercentage": 0-100,
  "matchedSkills": ["array", "of", "matched", "skills"],
  "missingSkills": ["array", "of", "missing", "skills"],
  "strengths": ["array", "of", "strengths"],
  "weaknesses": ["array", "of", "weaknesses"],
  "recommendation": "short text recommendation",
  "name": "candidate name"
}
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
      results.push({
        name: cand.name || result.name || '',
        email: cand.email || '',
        phone: cand.phone || '',
        education: cand.education || '',
        summary: cand.summary || result.recommendation || '',
        matchPercentage: result.matchPercentage,
        matchedSkills: result.matchedSkills,
        missingSkills: result.missingSkills,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        recommendation: result.recommendation
      });
    }

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