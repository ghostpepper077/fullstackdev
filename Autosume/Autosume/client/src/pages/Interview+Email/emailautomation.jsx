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
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

// AI Generation Helper
const generateWithAI = async (candidate, interview, type) => {
  try {
    const res = await axios.post("http://localhost:5000/api/ai/generate-email", {
      candidate,
      interview,
      type,
    });
    return res.data.message;
  } catch (error) {
    console.error("AI generation error:", error);
    return "⚠️ Failed to generate email. Please try again.";
  }
};

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

  // On decision radio change
  const handleDecisionChange = async (event) => {
    const value = event.target.value;
    setDecision(value);
    const aiText = await generateWithAI(candidate, interview, value);
    setEmailBody(aiText);
  };

  // Manual regenerate AI
  const handleGenerateAI = async () => {
    const aiText = await generateWithAI(candidate, interview, decision);
    setEmailBody(aiText);
  };

  // Final send email
  const handleSend = () => {
    alert(`✅ Email sent to ${candidate.email}`);
    navigate("/interviewdashboard");
  };

  if (!candidate?.name || !interview?.date) {
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
        {/* Left Panel */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
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

        {/* Right Panel */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4 }}>
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

            <Button onClick={handleGenerateAI} sx={{ mt: 2 }}>
              ✨ Regenerate with AI
            </Button>

            <Box mt={4}>
              <Typography fontWeight="bold" gutterBottom>
                📬 Email Preview
              </Typography>
              <TextField
                multiline
                fullWidth
                rows={8}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                variant="outlined"
                sx={{ backgroundColor: "#f9f9f9", fontFamily: "monospace" }}
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
