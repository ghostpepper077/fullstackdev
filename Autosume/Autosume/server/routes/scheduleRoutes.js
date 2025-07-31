// server/routes/scheduleRoutes.js

const express = require("express");
const router = express.Router();
const Candidate = require("../models/Candidate");
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ AI-Suggested Optimal Interview Slot
router.get("/ai-optimal-slot", async (req, res) => {
  try {
    const scheduled = await Candidate.find({
      date: { $ne: "-" },
      time: { $ne: "-" },
      interviewer: { $ne: "-" },
    });

    const prompt = `
You are a scheduling assistant. Based on the following scheduled interviews, suggest ONE optimal interview slot (date, time, interviewer) for a new candidate within the next 14 days.

Avoid:
- Scheduling the same interviewer at the same date/time.
- Clumping too many interviews on the same day.
- Overloading a single interviewer.

Return only a JSON object in this format:
 { "date": "2025-08-03", "time": "10:00 AM", "interviewer": "Gabriel Tan" }

Scheduled Interviews:
${scheduled
  .map((s) => `${s.name} on ${s.date} at ${s.time} with ${s.interviewer}`)
  .join("\n")}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a scheduling assistant." },
        { role: "user", content: prompt },
      ],
    });

    let suggestion = completion.choices[0].message.content.trim();

    // Remove markdown code block wrapper if present
    if (suggestion.startsWith("```")) {
      suggestion = suggestion
        .replace(/```[a-z]*\\n?/gi, "")
        .replace(/```$/, "")
        .trim();
    }

    const parsed = JSON.parse(suggestion);

    res.json(parsed);
  } catch (error) {
    console.error("AI scheduling error:", error.message);
    res.status(500).json({ error: "Failed to generate optimal slot." });
  }
});

// ✅ Get All Currently Booked Slots
router.get("/availability", async (req, res) => {
  try {
    const candidates = await Candidate.find({ status: { $ne: "Unscheduled" } });

    const takenSlots = candidates.map((c) => {
      return `${c.date}__${c.time}__${c.interviewer}`;
    });

    res.json(takenSlots);
  } catch (error) {
    console.error("Error getting availability:", error.message);
    res.status(500).json({ message: "Server error while fetching slots" });
  }
});

module.exports = router;
