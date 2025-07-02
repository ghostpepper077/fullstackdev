import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Grid,
} from "@mui/material";
import { useLocation , useNavigate } from "react-router-dom";
import axios from 'axios';

  

function generateWithAI(candidate, interview, type) {
  const intro =
    type === "approve"
      ? `Hi ${candidate.name},\n\nWe’re thrilled to invite you for an interview for the ${candidate.role} position.`
      : `Hi ${candidate.name},\n\nThank you for applying for the ${candidate.role} position.`;

  const interviewDetails =
    type === "approve"
      ? `\n\nHere are the interview details:\n📅 Date: ${interview.date}\n🕒 Time: ${interview.time}\n👤 Interviewer: ${interview.interviewer}`
      : `\n\nAfter careful consideration, we’ve decided to proceed with other candidates at this time.`;

  const outro =
    type === "approve"
      ? `\n\nWe look forward to speaking with you!\n\nBest regards,\nHR Team`
      : `\n\nWe appreciate your interest and encourage you to apply again in the future.\n\nBest wishes,\nHR Team`;

  return `${intro}${interviewDetails}${outro}`;
}

export default function EmailAutomation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { candidate } = location.state || {};
  const interview = {
    date: candidate?.date,
    time: candidate?.time,
    interviewer: candidate?.interviewer,
  };

  const [decision, setDecision] = useState("approve");
  const [emailBody, setEmailBody] = useState("");

  const handleDecisionChange = (event) => {
    const value = event.target.value;
    setDecision(value);
    setEmailBody(generateWithAI(candidate, interview, value));
  };

  const handleSend = () => {
  alert(`✅ Email sent to ${candidate.email}`);
  navigate('/interviewdashboard');
};

  if (!candidate.name || !interview.date) {
    return (
      <Box p={5}>
        <Typography variant="h6" color="error">
          Missing candidate or interview data.
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={5} minHeight="100vh" bgcolor="#f5f5f5">
      <Typography variant="h4" fontWeight={600} gutterBottom color="primary">
        Email Automation
      </Typography>

      <Grid container spacing={4}>
        {/* Candidate Info */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, backgroundColor: "#fff" }}>
            <Typography variant="h6" color="text.primary">
              Candidate Info
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography>
              <strong>Name:</strong> {candidate.name}
            </Typography>
            <Typography>
              <strong>Email:</strong> {candidate.email}
            </Typography>
            <Typography>
              <strong>Role:</strong> {candidate.role}
            </Typography>
            <Typography>
              <strong>Match:</strong> {candidate.match || "N/A"}%
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography>📅 {interview.date}</Typography>
            <Typography>🕒 {interview.time}</Typography>
            <Typography>👤 {interview.interviewer}</Typography>
          </Paper>
        </Grid>

        {/* Email Generator */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4, backgroundColor: "#ffffff" }}>
            <Typography variant="h6" gutterBottom>
              Notification Type
            </Typography>
            <RadioGroup row value={decision} onChange={handleDecisionChange}>
              <FormControlLabel
                value="approve"
                control={<Radio />}
                label="✅ Approve (send interview invitation)"
              />
              <FormControlLabel
                value="reject"
                control={<Radio />}
                label="❌ Reject (send polite rejection)"
              />
            </RadioGroup>

            <Button
              variant="outlined"
              onClick={() =>
                setEmailBody(generateWithAI(candidate, interview, decision))
              }
              sx={{ mt: 2 }}
            >
              ✨ Regenerate with AI
            </Button>

            <Box mt={4}>
              <Typography fontWeight="bold" gutterBottom>
                📬 Email Preview
              </Typography>
              <TextField
                multiline
                fullWidth
                minRows={2}
                maxRows={12}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                variant="outlined"
                sx={{
                  backgroundColor: "#f9f9f9",
                  fontFamily: "monospace",
                }}
              />
            </Box>

            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
              onClick={handleSend}
              fullWidth
            >
              🚀 Send Email
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
