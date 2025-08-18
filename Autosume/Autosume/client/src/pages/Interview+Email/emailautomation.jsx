import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Divider,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import axios from "axios";

const generateWithAI = async (candidate, interview, tone) => {
  try {
    const res = await axios.post(
      "http://localhost:5000/api/ai/generate-email",
      {
        candidate,
        interview,
        type: "approve",
        tone,
      }
    );
    return res.data.message;
  } catch (error) {
    if (error.response?.status === 429) {
      return "⚠️ API quota limit reached. Please try again later.";
    }
    return "⚠️ Failed to generate email. Please try again.";
  }
};

const steps = ["Select Candidate", "Generate Email", "Send Email"];

export default function EmailAutomation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { candidate } = location.state || {};
  const interview = {
    date: candidate?.date,
    time: candidate?.time,
    interviewer: candidate?.interviewer,
  };

  const [tone, setTone] = useState("friendly");
  const [emailBody, setEmailBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sent, setSent] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  const handleGenerateAI = async () => {
    setLoading(true);
    setSuccess(false);
    const aiText = await generateWithAI(candidate, interview, tone);
    setEmailBody(aiText);
    setLoading(false);
    setSuccess(true);
    setActiveStep(2);
  };

  const handleSend = () => {
    setSent(true);
    setActiveStep(2);
    setConfirmOpen(false);
    setTimeout(() => {
      navigate("/interviewdashboard");
    }, 1500);
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

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel
              optional={
                activeStep > index ? (
                  <Tooltip title="Completed">
                    <DoneAllIcon color="success" />
                  </Tooltip>
                ) : null
              }
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Grid container spacing={4}>
        {/* Candidate Info */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3}>
            <Box
              sx={{
                background: "linear-gradient(to right, #1976d2, #42a5f5)",
                px: 3,
                py: 1.5,
                borderTopLeftRadius: "inherit",
                borderTopRightRadius: "inherit",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              }}
            >
              <Typography color="white" variant="h6">
                📄 Candidate Info
              </Typography>
            </Box>
            <Box p={3}>
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
              <Typography>⏰ {interview.time}</Typography>
              <Typography>👤 {interview.interviewer}</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Right Panel */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3}>
            <Box
              sx={{
                background: "linear-gradient(to right, #1976d2, #42a5f5)",
                px: 3,
                py: 1.5,
                borderTopLeftRadius: "inherit",
                borderTopRightRadius: "inherit",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              }}
            >
              <Typography color="white" variant="h6">
                ✨ Generate & Send Email
              </Typography>
            </Box>
            <Box p={4}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Tone</InputLabel>
                <Select
                  value={tone}
                  label="Tone"
                  onChange={(e) => setTone(e.target.value)}
                >
                  <MenuItem value="friendly">Friendly</MenuItem>
                  <MenuItem value="formal">Formal</MenuItem>
                  <MenuItem value="creative">Creative</MenuItem>
                </Select>
              </FormControl>

              <Button
                onClick={handleGenerateAI}
                sx={{ mb: 2 }}
                disabled={loading}
                variant="outlined"
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Generating...
                  </>
                ) : (
                  "✨ Generate with AI"
                )}
              </Button>

              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  ✅ Email generated!
                </Alert>
              )}

              <Box>
                <Typography fontWeight="bold" gutterBottom>
                  📬 Email Preview
                </Typography>
                <Box
                  sx={{
                    border: "1px solid #ccc",
                    borderRadius: 2,
                    padding: 2,
                    maxHeight: 300,
                    overflowY: "auto",
                    backgroundColor: "#fffaf0",
                    fontFamily: "Georgia, serif",
                    position: "relative",
                  }}
                >
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => navigator.clipboard.writeText(emailBody)}
                    sx={{ position: "absolute", top: 5, right: 5 }}
                    startIcon={<ContentCopyIcon />}
                  >
                    Copy
                  </Button>
                  <Typography whiteSpace="pre-wrap">{emailBody}</Typography>
                </Box>
              </Box>

              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 3 }}
                onClick={() => setConfirmOpen(true)}
                fullWidth
                disabled={!emailBody || loading}
              >
                🚀 Send Email
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Snackbar */}
      <Snackbar
        open={sent}
        autoHideDuration={3000}
        onClose={() => setSent(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSent(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          ✅ Email sent to {candidate.email}
        </Alert>
      </Snackbar>

      {/* Confirmation Modal */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Email Send</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to send this email to{" "}
            <strong>{candidate.email}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleSend} variant="contained" color="primary">
            Send Now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
