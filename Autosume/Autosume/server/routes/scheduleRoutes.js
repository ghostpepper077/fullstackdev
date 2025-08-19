// server/routes/scheduleRoutes.js
const express = require("express");
const router = express.Router();
const ScreenedCandidate = require("../models/ScreenedCandidate");
const { OpenAI } = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ---- Allowed options (single source of truth) ----
const ALLOWED_TIMES = ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM"];
const ALLOWED_INTERVIEWERS = ["Gabriel Tan", "Jace Lim", "Amira Soh"];

// Utility: strict check against allowed lists
const isAllowedTime = (t) => ALLOWED_TIMES.includes((t || "").trim());
const isAllowedInterviewer = (x) => ALLOWED_INTERVIEWERS.includes((x || "").trim());

// ✅ AI-Suggested Optimal Interview Slot
router.get("/ai-optimal-slot", async (req, res) => {
  try {
    // Existing scheduled interviews from ScreenedCandidate
    const scheduled = await ScreenedCandidate.find({
      status: "Scheduled",
      date: { $ne: "-" },
      time: { $ne: "-" },
      interviewer: { $ne: "-" },
    });

    // We explicitly constrain the model to ONLY pick from allowed times & interviewers
    const prompt = `
You are a scheduling assistant. Suggest ONE optimal interview slot (date, time, interviewer)
within the next 14 days for a new candidate.

HARD CONSTRAINTS (must follow):
- time MUST be one of: ${ALLOWED_TIMES.map((t) => `"${t}"`).join(", ")}
- interviewer MUST be one of: ${ALLOWED_INTERVIEWERS.map((i) => `"${i}"`).join(", ")}
- Avoid double-booking the same interviewer at the same date/time.
- Try not to clump too many interviews on the same day or overload a single interviewer.

Return ONLY a JSON object in this exact format (no extra text/code fences):
{ "date": "YYYY-MM-DD", "time": "10:00 AM", "interviewer": "Gabriel Tan" }

These are the already scheduled interviews:
${scheduled
  .map((s) => `${s.name} on ${s.date} at ${s.time} with ${s.interviewer}`)
  .join("\n")}
`.trim();

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a precise scheduling assistant that outputs strict JSON only." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    });

    const raw = completion.choices[0].message.content?.trim() || "";

    // Try to unwrap fenced JSON if present
    const fenced = raw.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    const body = fenced ? fenced[1] : raw;

    // Parse the model’s JSON (or fallback extractors)
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      const date =
        body.match(/"date"\s*:\s*"([^"]+)"/)?.[1] ||
        body.match(/\b(\d{4}-\d{2}-\d{2})\b/)?.[1];
      const time =
        body.match(/"time"\s*:\s*"([^"]+)"/)?.[1] ||
        body.match(/\b(1?\d:\d{2}\s?[AP]M)\b/i)?.[1];
      const interviewer = body.match(/"interviewer"\s*:\s*"([^"]+)"/)?.[1];
      parsed = { date, time, interviewer };
    }

    // Validate date within next 14 days
    const now = new Date();
    const max = new Date(now);
    max.setDate(max.getDate() + 14);
    const d = parsed?.date ? new Date(parsed.date) : null;
    const okDate = d && !isNaN(d) && d >= new Date(now.toDateString()) && d <= max;

    // ❗ Enforce allowed TIME & INTERVIEWER — if not allowed, invalidate to trigger fallback
    if (!isAllowedTime(parsed?.time)) {
      parsed.time = null;
    }
    if (!isAllowedInterviewer(parsed?.interviewer)) {
      parsed.interviewer = null;
    }

    let ok = okDate && parsed?.time && parsed?.interviewer;

    // If anything is invalid -> Fallback: pick first free allowed slot by scanning
    if (!ok) {
      const existing = await ScreenedCandidate.find({
        date: { $ne: "-" },
        time: { $ne: "-" },
        interviewer: { $ne: "-" },
        status: "Scheduled",
      });
      const taken = new Set(
        existing.map((s) => `${s.date}__${s.time}__${s.interviewer}`)
      );

      let best = null;
      for (let i = 1; i <= 14 && !best; i++) {
        const day = new Date(now);
        day.setDate(day.getDate() + i);
        const dateStr = day.toISOString().slice(0, 10);
        for (const t of ALLOWED_TIMES) {
          for (const iv of ALLOWED_INTERVIEWERS) {
            if (!taken.has(`${dateStr}__${t}__${iv}`)) {
              best = { date: dateStr, time: t, interviewer: iv };
              break;
            }
          }
          if (best) break;
        }
      }
      parsed = best || { date: null, time: null, interviewer: null };
    }

    // At this point, parsed.time & parsed.interviewer are guaranteed to be from the allowed lists (or nulls)
    return res.json(parsed);
  } catch (error) {
    console.error("AI scheduling error:", error);
    res.status(500).json({ error: "Failed to generate optimal slot." });
  }
});

// ✅ Get All Currently Booked Slots (for conflict UI)
router.get("/availability", async (req, res) => {
  try {
    const candidates = await ScreenedCandidate.find({
      status: { $in: ["Scheduled", "Emailed"] },
      date: { $ne: "-" },
      time: { $ne: "-" },
      interviewer: { $ne: "-" },
    });

    const takenSlots = candidates.map((c) => `${c.date}__${c.time}__${c.interviewer}`);
    res.json(takenSlots);
  } catch (error) {
    console.error("Error getting availability:", error.message);
    res.status(500).json({ message: "Server error while fetching slots" });
  }
});

module.exports = router;
