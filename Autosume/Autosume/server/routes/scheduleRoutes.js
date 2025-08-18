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

     const raw = completion.choices[0].message.content.trim();

    // 1) Try to unwrap ```json ... ```
   const fenced = raw.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
   const body = fenced ? fenced[1] : raw;

   // 2) Try strict JSON first; otherwise try to salvage fields
    let parsed;
   try {
     parsed = JSON.parse(body);
    } catch {
      const date = body.match(/"date"\s*:\s*"([^"]+)"/)?.[1]
              || body.match(/\b(\d{4}-\d{2}-\d{2})\b/)?.[1];
      const time = body.match(/"time"\s*:\s*"([^"]+)"/)?.[1]
               || body.match(/\b(1?\d:\d{2}\s?[AP]M)\b/i)?.[1];
     const interviewer = body.match(/"interviewer"\s*:\s*"([^"]+)"/)?.[1];
     parsed = { date, time, interviewer };
   }

   // 3) Validate & clamp to next 14 days
   const now = new Date();
   const max = new Date(now); max.setDate(max.getDate() + 14);
    const d = parsed?.date ? new Date(parsed.date) : null;
    const okDate = d && d >= now && d <= max;
   const ok = okDate && parsed?.time && parsed?.interviewer;

   if (!ok) {
      // Fallback: pick the first free slot by scanning current load
     const taken = new Set((await Candidate.find({
       date: { $ne: "-" }, time: { $ne: "-" }, interviewer: { $ne: "-" },
      })).map(s => `${s.date}__${s.time}__${s.interviewer}`));

      const times = ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM"];
     const interviewers = ["Gabriel Tan", "Jace Lim", "Amira Soh"];
      let best = null;
      for (let i = 1; i <= 14 && !best; i++) {
       const day = new Date(now); day.setDate(day.getDate() + i);
       const dateStr = day.toISOString().slice(0,10);
       for (const t of times) for (const iv of interviewers) {
         if (!taken.has(`${dateStr}__${t}__${iv}`)) { best = { date: dateStr, time: t, interviewer: iv }; break; }
       }
      }
      parsed = best || { date: null, time: null, interviewer: null };
   }

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
