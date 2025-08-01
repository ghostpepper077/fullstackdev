import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  Paper,
  Select,
  MenuItem,
  Chip,
  TextField,
  Snackbar,
  Alert,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import {
  CalendarToday,
  AccessTime,
  Person,
  DoneAll,
  SmartToy,
} from "@mui/icons-material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";

const timeSlots = ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM"];
const interviewers = ["Gabriel Tan", "Jace Lim", "Amira Soh"];

const steps = ["Select Slot", "Confirm Interview", "Email Notification"];

export default function InterviewScheduling() {
  const location = useLocation();
  const navigate = useNavigate();
  const candidate = location.state?.candidate;

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedInterviewer, setSelectedInterviewer] = useState("");
  const [existingSchedules, setExistingSchedules] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/interviews/all"
        );
        setExistingSchedules(response.data);
      } catch (error) {
        console.error("Error fetching existing schedules:", error);
      }
    };
    fetchSchedules();
  }, []);

  const getAvailableTimeSlots = () => {
    if (!selectedDate || !selectedInterviewer) return timeSlots;
    const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
    const conflicts = existingSchedules
      .filter(
        (s) =>
          s.date === selectedDateStr && s.interviewer === selectedInterviewer
      )
      .map((s) => s.time);
    return {
      available: timeSlots.filter((t) => !conflicts.includes(t)),
      conflicts,
    };
  };

  const handleSchedule = async () => {
    const payload = {
      name: candidate.name,
      date: format(selectedDate, "yyyy-MM-dd"),
      time: selectedTime,
      interviewer: selectedInterviewer,
    };

    try {
      await axios.post(
        "http://localhost:5000/api/interviews/schedule",
        payload
      );
      setActiveStep(2);
      setConfirmOpen(false);

      setTimeout(() => {
        navigate("/emailautomation", {
          state: {
            candidate: {
              ...candidate,
              ...payload,
              status: "Scheduled",
            },
          },
        });
      }, 1000);
    } catch (err) {
      console.error("❌ Failed to save interview:", err);
      alert("Error saving interview to database.");
    }
  };

  const handleAutoSchedule = async () => {
    setLoadingAI(true);
    setOpenSnackbar(false);
    try {
      const res = await axios.get(
        "http://localhost:5000/api/schedules/ai-optimal-slot"
      );
      const { date, time, interviewer } = res.data;
      setSelectedDate(new Date(date));
      setSelectedTime(time);
      setSelectedInterviewer(interviewer);
      setActiveStep(1);
      setOpenSnackbar(true);
    } catch (err) {
      console.error("AI slot suggestion failed:", err);
      alert("⚠️ Failed to generate AI-based slot. Try manual or fallback.");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSubmitClick = () => {
    if (!selectedDate || !selectedTime || !selectedInterviewer) {
      return;
    }
    setConfirmOpen(true);
  };

  const { available, conflicts = [] } = getAvailableTimeSlots();

  if (!candidate) {
    return (
      <Box p={5} textAlign="center">
        <Typography variant="h6" color="error">
          ⚠️ No candidate selected. Please return to the shortlist page.
        </Typography>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate("/shortlistoverview")}
        >
          Go Back to Shortlist
        </Button>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box p={4} bgcolor="#f0f2f5" minHeight="100vh">
        <Typography variant="h4" fontWeight={700} gutterBottom color="primary">
          Interview Scheduling
        </Typography>

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel
                optional={
                  activeStep > index ? (
                    <Tooltip title="Completed">
                      <DoneAll color="success" />
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
                  👤 Candidate Info
                </Typography>
              </Box>
              <Box p={3}>
                <Typography variant="h6">{candidate.name}</Typography>
                <Typography variant="subtitle2">{candidate.role}</Typography>
                <Box mt={2}>
                  <Typography variant="body2">{candidate.email}</Typography>
                  <Typography variant="body2">{candidate.phone}</Typography>
                </Box>
                <Box mt={2}>
                  <Typography fontWeight="bold" mb={1}>
                    Skills:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {candidate.skills?.map((s, i) => (
                      <Chip
                        key={i}
                        label={s}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Schedule Form */}
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
                  📅 Schedule Details
                </Typography>
              </Box>
              <Box p={4}>
                {/* Date Picker */}
                <Box mt={2}>
                  <Typography variant="subtitle2" mb={1}>
                    <CalendarToday fontSize="small" /> Select Interview Date
                  </Typography>
                  <DatePicker
                    label="Pick a date"
                    value={selectedDate}
                    onChange={(newDate) => setSelectedDate(newDate)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!selectedDate}
                        helperText={!selectedDate ? "Date is required" : ""}
                      />
                    )}
                  />
                </Box>

                {/* Time Slots */}
                <Box mt={4}>
                  <Typography variant="subtitle2" mb={1}>
                    <AccessTime fontSize="small" /> Choose Time Slot
                  </Typography>
                  <Box display="flex" gap={2} flexWrap="wrap">
                    {timeSlots.map((slot) => (
                      <Button
                        key={slot}
                        variant={
                          selectedTime === slot ? "contained" : "outlined"
                        }
                        color="primary"
                        disabled={conflicts.includes(slot)}
                        onClick={() => setSelectedTime(slot)}
                      >
                        {slot}
                      </Button>
                    ))}
                  </Box>
                  {!selectedTime && (
                    <Typography color="error" variant="caption">
                      Please select a time
                    </Typography>
                  )}
                </Box>

                {/* Interviewer */}
                <Box mt={4}>
                  <Typography variant="subtitle2" mb={1}>
                    <Person fontSize="small" /> Assign Interviewer
                  </Typography>
                  <Select
                    fullWidth
                    value={selectedInterviewer}
                    onChange={(e) => setSelectedInterviewer(e.target.value)}
                    displayEmpty
                    error={!selectedInterviewer}
                  >
                    <MenuItem value="" disabled>
                      Select Interviewer
                    </MenuItem>
                    {interviewers.map((name) => (
                      <MenuItem key={name} value={name}>
                        {name}
                      </MenuItem>
                    ))}
                  </Select>
                  {!selectedInterviewer && (
                    <Typography color="error" variant="caption">
                      Interviewer is required
                    </Typography>
                  )}
                </Box>

                {/* Buttons */}
                <Box display="flex" gap={2} mt={4} alignItems="center">
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleAutoSchedule}
                    disabled={loadingAI}
                    startIcon={<SmartToy />}
                  >
                    {loadingAI ? "Thinking..." : "Suggest Optimal Slot"}
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmitClick}
                    disabled={
                      !selectedDate || !selectedTime || !selectedInterviewer
                    }
                  >
                    Schedule Interview
                  </Button>
                </Box>

                {/* Summary */}
                <Box mt={5} bgcolor="#f9f9f9" p={3} borderRadius={2}>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                    📝 Interview Summary
                  </Typography>
                  <Typography>
                    📅 Date: {selectedDate?.toDateString() || "N/A"}
                  </Typography>
                  <Typography>⏰ Time: {selectedTime || "N/A"}</Typography>
                  <Typography>
                    👤 Interviewer: {selectedInterviewer || "N/A"}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Snackbar */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setOpenSnackbar(false)}
            severity="info"
            sx={{ width: "100%" }}
          >
            🧠 GPT selected a conflict-free optimal slot based on current load
            and distribution.
          </Alert>
        </Snackbar>

        {/* Confirmation Modal */}
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>Confirm Interview</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to schedule this interview on{" "}
              <strong>{selectedDate?.toDateString()}</strong> at{" "}
              <strong>{selectedTime}</strong> with{" "}
              <strong>{selectedInterviewer}</strong>?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSchedule}
              variant="contained"
              color="primary"
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}
