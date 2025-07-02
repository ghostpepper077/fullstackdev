import React, { useState } from 'react';
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
} from '@mui/material';
import { useLocation } from 'react-router-dom';

function generateWithAI(candidate, interview, type) {
  const intro =
    type === 'approve'
      ? `Hi ${candidate.name},\n\nWe’re thrilled to invite you for an interview for the ${candidate.role} position.`
      : `Hi ${candidate.name},\n\nThank you for applying for the ${candidate.role} position.`;

  const interviewDetails =
    type === 'approve'
      ? `\n\nHere are the interview details:\n📅 Date: ${interview.date}\n🕒 Time: ${interview.time}\n👤 Interviewer: ${interview.interviewer}`
      : `\n\nAfter careful consideration, we’ve decided to proceed with other candidates at this time.`;

  const outro =
    type === 'approve'
      ? `\n\nWe look forward to speaking with you!\n\nBest regards,\nHR Team`
      : `\n\nWe appreciate your interest and encourage you to apply again in the future.\n\nBest wishes,\nHR Team`;

  return `${intro}${interviewDetails}${outro}`;
}

export default function EmailAutomation() {
  const location = useLocation();
  const candidate = location.state?.candidate || {};
  const interview = location.state?.interview || {};

  const [decision, setDecision] = useState('approve');
  const [emailBody, setEmailBody] = useState(() =>
    generateWithAI(candidate, interview, 'approve')
  );

  const handleDecisionChange = (event) => {
    const value = event.target.value;
    setDecision(value);
    setEmailBody(generateWithAI(candidate, interview, value));
  };

  const handleSend = () => {
    alert(`Email sent to ${candidate.email}`);
  };

  if (!candidate.name || !interview.date) {
    return (
      <Box p={5}>
        <Typography variant="h6">Missing candidate or interview data.</Typography>
      </Box>
    );
  }

  return (
    <Box p={5} minHeight="100vh" bgcolor="#f5f5f5">
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Email Notification
      </Typography>

      <Grid container spacing={3}>
        {/* Candidate Info */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom>
              Candidate: {candidate.name}
            </Typography>
            <Typography>Email: {candidate.email}</Typography>
            <Typography>Role: {candidate.role}</Typography>
            <Typography>Match: {candidate.match || 'N/A'}%</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography>
              📅 Date: <strong>{interview.date}</strong>
            </Typography>
            <Typography>
              🕒 Time: <strong>{interview.time}</strong>
            </Typography>
            <Typography>
              👤 Interviewer: <strong>{interview.interviewer}</strong>
            </Typography>
          </Paper>
        </Grid>

        {/* Email Form */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography fontWeight="bold" gutterBottom>
              Email Type
            </Typography>
            <RadioGroup row value={decision} onChange={handleDecisionChange}>
              <FormControlLabel value="approve" control={<Radio />} label="Approve" />
              <FormControlLabel value="reject" control={<Radio />} label="Reject" />
            </RadioGroup>

            <Button
              variant="outlined"
              size="small"
              onClick={() =>
                setEmailBody(generateWithAI(candidate, interview, decision))
              }
              sx={{ mt: 2 }}
            >
              Generate with AI
            </Button>

            <Typography fontWeight="bold" sx={{ mt: 3, mb: 1 }}>
              Email Preview
            </Typography>
            <TextField
              multiline
              fullWidth
              rows={10}
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              variant="outlined"
            />

            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
              onClick={handleSend}
            >
              Send Email
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
