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

export default function EmailAutomation() {
  const location = useLocation();
  const candidate = location.state?.candidate || {};
  const interview = location.state?.interview || {};

  const [decision, setDecision] = useState('approve');
  const [emailBody, setEmailBody] = useState(() => {
    return generateEmail(candidate, interview, 'approve');
  });

  function generateEmail(candidate, interview, type) {
    if (!candidate?.name || !interview?.date || !interview?.time || !interview?.interviewer) {
      return 'Please complete the interview scheduling step first.';
    }

    if (type === 'approve') {
      return `Hi ${candidate.name},

We’re pleased to inform you that you’ve been shortlisted for an interview for the ${candidate.role} position.

📅 Date: ${interview.date}
🕒 Time: ${interview.time}
👤 Interviewer: ${interview.interviewer}

We look forward to speaking with you!

Best regards,
HR Team`;
    } else {
      return `Hi ${candidate.name},

Thank you for applying for the ${candidate.role} position. After reviewing your application, we regret to inform you that you have not been shortlisted for an interview at this time.

We encourage you to apply for future openings.

Best wishes,
HR Team`;
    }
  }

  const handleDecisionChange = (event) => {
    const value = event.target.value;
    setDecision(value);
    setEmailBody(generateEmail(candidate, interview, value));
  };

  const handleSend = () => {
    alert(`Email sent to ${candidate.email}`);
  };

  return (
    <Box p={5} minHeight="100vh" bgcolor="#f5f5f5">
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Email Notification
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom>
              Candidate: {candidate.name || 'N/A'}
            </Typography>
            <Typography>Email: {candidate.email || 'N/A'}</Typography>
            <Typography>Role: {candidate.role || 'N/A'}</Typography>
            <Typography>Match: {candidate.match || 'N/A'}%</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography>
              📅 Date: <strong>{interview.date || 'N/A'}</strong>
            </Typography>
            <Typography>
              🕒 Time: <strong>{interview.time || 'N/A'}</strong>
            </Typography>
            <Typography>
              👤 Interviewer: <strong>{interview.interviewer || 'N/A'}</strong>
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography fontWeight="bold" gutterBottom>
              Email Type
            </Typography>
            <RadioGroup row value={decision} onChange={handleDecisionChange}>
              <FormControlLabel value="approve" control={<Radio />} label="Approve" />
              <FormControlLabel value="reject" control={<Radio />} label="Reject" />
            </RadioGroup>

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
