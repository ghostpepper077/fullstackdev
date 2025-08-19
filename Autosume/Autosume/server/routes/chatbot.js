// routes/chatbot.js
const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const ChatMessage = require('../models/ChatMessage');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/chat', async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message || !sessionId) {
    return res.status(400).json({ error: 'Message and sessionId are required' });
  }

  const handbookText = `
STAFF HANDBOOK (May 2025) - Summary

[Employment Terms]
- Probation: 3-6 months depending on grade. Confirmation gives full benefits.
- Termination: Notice ranges from 1 week (junior) to 2 months (senior). Either party may terminate with notice or salary-in-lieu. Exit clearance required.
- Transfers: May be reassigned for career or service needs.
- External Employment: Not allowed without written approval.
- Retirement: Normal at 63; re-employment possible up to 68.
- Working Hours (Main Office): Mon-Thu 9am-6pm, Fri 9am-5:30pm. Staggered hours 8-10am start. Sat off. First day of Lunar New Year is compulsory workday, compensated with 1 day off.
- Overtime: Eligible staff may claim. Others get time-off in lieu. Time-off must be within same year (not on eves of major festivals).
- Records: Staff must keep HR updated on personal details.

[Leave & Benefits]
- Annual Leave: 14-28 days depending on grade & service years. Pro-rated for new hires. Max 1 year's leave can be carried forward.
- Sick Leave: 14 days outpatient / 60 days with hospitalisation. Requires medical certificate.
- Extended Hospitalisation Leave: Extra 0-5 months depending on service length.
- Prolonged Illness Leave: Up to 6 months for chronic/occupational illnesses.
- Other Leave: 
  • National Service (as required)  
  • Marriage (4 days, first legal marriage)  
  • Compassionate (4 days for immediate family deaths)  
  • Maternity (16 weeks if SG citizen child; 12 weeks otherwise)  
  • Adoption (up to 12 weeks if child <12 months, SG citizen)  
  • Paternity (2 weeks)  
  • Shared Parental (up to 4 weeks)  
  • Childcare (6 days if SG citizen child <7, 2 days otherwise)  
  • Extended Childcare (2 days if child 7-12, SG citizen)  
  • Infant Care (6 days unpaid, child <2, SG citizen)  
  • Exam Leave (for work-related studies)  
  • Community Care (1 day)  
  • Lifelong Learning (2 days self-funded)  
  • No Pay Leave (case-by-case approval)

[Medical & Dental Benefits]
- Insurance: Group Hospitalisation & Surgical, GP, A&E, Polyclinic, and some TCM covered.
- Specialist: First referral reimbursed in full, subsequent visits up to $20/visit.
- Dental & Optical: $120/year for approved dental/optical expenses.

[Other Benefits]
- Work Injury Compensation Insurance.
- Group Accidental Death & Dismemberment Insurance.
- Retrenchment Benefit: 0.5 month's basic pay per completed year (min 2 years service).
- Staff Welfare Fund: Cash/flowers/gifts for childbirth, weddings, hospitalisation, bereavement.

[Compensation & Performance Review]
- Salary: Credited on 20th monthly. Pay slip available in e-HR.
- Bonuses: AWS (13th month), mid-year, and year-end bonuses (based on performance).
- Performance Review: Annual appraisal + quarterly check-ins. Salary increments from 1 July.
- Promotion: Based on performance, merit, and competency.

[Transport & Travel]
- Local Transport: Mileage claims - car $0.85/km, motorcycle $0.20/km. Public transport reimbursed for official trips (not home ↔ office).
- Overseas Travel: Economy class, per diem allowance (IRAS rates), travel insurance provided.

[Training & Development]
- Training supports skills, promotion readiness, and technical expertise.
- May include training bond for sponsored courses.
- Uses Competency Framework for Chambers/Trade Associations.

[Code of Conduct]
- Professional behaviour guided by “Spirit of Chinese Entrepreneurs”: Integrity, Loyalty, Innovation, Giving Back.
- IT Policy: Adhere to cybersecurity & email/IT usage rules. Chamber may monitor communications.
- Confidentiality: All documents/data remain confidential.
- Social Media: No unauthorised posting about Chamber or colleagues.
- Work Attendance: Must report on time; absence >2 days without notice = breach.
- Discipline: Counselling → Verbal → Written Warning → Dismissal.
- Misconduct: Theft, falsification, absenteeism, insubordination, intoxication, fighting, etc.
- Intellectual Property: All work output belongs to Chamber.
- Grievance Handling: Stepwise escalation to supervisor → HR → resolution in 7 days.
- Attire: Business casual Mon-Thu, smart casual Fri, corporate tee when required.
- No smoking or gambling in office.
- External employment, conflict of interest, and gifts must be declared.

[Data Protection]
- Staff must comply with PDPA. Chamber may process and use employee data as per policy.
`;

  const prompt = `
You are a helpful assistant who answers questions based on the company handbook below. Give suggestion what questions the user can ask.

Handbook:
${handbookText}

User Question:
${message}

Please answer based on the handbook. If the question is unrelated, politely inform the user you can only answer questions related to the handbook. You can accept thank yous and goodbyes.
`;

  try {
    // Save user message
    await ChatMessage.create({ sessionId, role: 'user', message });

    // Get response
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const botReply = completion.choices[0].message.content;

    // Save bot reply
    await ChatMessage.create({ sessionId, role: 'bot', message: botReply });

    res.json({ reply: botReply });
  } catch (error) {
    console.error('Error in chatbot route:', error.message);
    res.status(500).json({ error: 'Chatbot generation failed' });
  }
});

// Get chat history by session
router.get('/history/:sessionId', async (req, res) => {
  try {
    const messages = await ChatMessage.find({ sessionId: req.params.sessionId }).sort({ timestamp: 1 });
    const formatted = messages.map(msg => ({
      text: msg.message,
      isUser: msg.role === 'user',
    }));
    res.json({ messages: formatted });
  } catch (error) {
    console.error('Error fetching chat history:', error.message);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

module.exports = router;

