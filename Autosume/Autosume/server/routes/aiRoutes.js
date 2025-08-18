const express = require("express");
const router = express.Router();
const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/generate-email", async (req, res) => {
    const { candidate = {}, interview = {}, type = "approve", tone = "friendly" } = req.body;
  if (!candidate?.name || !candidate?.role) {
    return res.status(400).json({ error: "Missing candidate.name or candidate.role" });
 }

  try {
    const prompt = `
Write a professional ${tone} congratulatory email.
Name: ${candidate.name}
Position: ${candidate.role}
Skills: ${candidate.skills?.join(", ")}
Scheduled Interview: ${interview?.date || "-"} at ${interview?.time || "-"}
Interviewer: ${interview?.interviewer || "-"}

Return ONLY JSON:
{ "subject": "<string>", "body": "<multiline plain text>" }
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });

     const raw = completion.choices[0].message.content?.trim() || "{}";
    const fenced = raw.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    const json = JSON.parse(fenced ? fenced[1] : raw);
   res.json({ subject: json.subject || "Interview Confirmation", message: json.body || "" });
  } catch (error) {
    console.error("Error generating email:", error.response?.data || error.message || error);
    res.status(500).json({ error: "AI generation failed" });
  }
});

module.exports = router;
