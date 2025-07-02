import React, { useState } from 'react';
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
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useLocation, useNavigate } from 'react-router-dom';

const timeSlots = ['10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM'];
const interviewers = ['Gabriel Tan', 'Jace Lim', 'Amira Soh'];

export default function InterviewScheduling() {
  const location = useLocation();
  const navigate = useNavigate();

  const candidate = location.state?.candidate;

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedInterviewer, setSelectedInterviewer] = useState('');

  const handleSchedule = () => {
    if (selectedDate && selectedTime && selectedInterviewer) {
      navigate('/emailautomation', {
        state: {
          candidate: {
            ...candidate,
            date: selectedDate.toDateString(),
            time: selectedTime,
            interviewer: selectedInterviewer,
            status: 'Scheduled',
          },
        },
      });
    } else {
      alert('Please complete all fields.');
    }
  };

  const handleAutoSchedule = () => {
    const today = new Date();
    const randomOffset = Math.floor(Math.random() * 10) + 1;
    const autoDate = new Date(today.setDate(today.getDate() + randomOffset));

    const autoTime = timeSlots[Math.floor(Math.random() * timeSlots.length)];
    const autoInterviewer =
      interviewers[Math.floor(Math.random() * interviewers.length)];

    setSelectedDate(autoDate);
    setSelectedTime(autoTime);
    setSelectedInterviewer(autoInterviewer);
  };

  if (!candidate) {
    return (
      <Box p={5} textAlign="center">
        <Typography variant="h6" color="error">
          ⚠️ No candidate selected. Please return to the shortlist page.
        </Typography>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate('/shortlistoverview')}
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

      <Grid container spacing={4}>
        {/* Candidate Info */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              backgroundColor: 'white',
              borderLeft: '5px solid #1976d2',
            }}
          >
            <Typography variant="h6" color="text.primary">
              {candidate.name}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {candidate.role}
            </Typography>

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
                  <Chip key={i} label={s} color="primary" variant="outlined" />
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Scheduling Form */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4, backgroundColor: '#ffffff' }}>
            <Typography variant="h6" gutterBottom color="text.primary">
              📅 Schedule Details
            </Typography>

            {/* Date */}
            <Box mt={2}>
              <Typography variant="subtitle2" mb={1}>
                Select Interview Date
              </Typography>
              <DatePicker
                label="Pick a date"
                value={selectedDate}
                onChange={(newDate) => setSelectedDate(newDate)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Box>

            {/* Time Slots */}
            <Box mt={4}>
              <Typography variant="subtitle2" mb={1}>
                Choose Time Slot
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot}
                    variant={selectedTime === slot ? 'contained' : 'outlined'}
                    color="primary"
                    onClick={() => setSelectedTime(slot)}
                  >
                    {slot}
                  </Button>
                ))}
              </Box>
            </Box>

            {/* Interviewer */}
            <Box mt={4}>
              <Typography variant="subtitle2" mb={1}>
                Assign Interviewer
              </Typography>
              <Select
                fullWidth
                value={selectedInterviewer}
                onChange={(e) => setSelectedInterviewer(e.target.value)}
                displayEmpty
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
            </Box>

            {/* Action Buttons */}
            <Box display="flex" gap={2} mt={4}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleAutoSchedule}
              >
                🧠 Suggest Optimal Slot
              </Button>

              <Button
                variant="contained"
                color="primary"
                onClick={handleSchedule}
              >
                Schedule Interview
              </Button>
            </Box>

            {/* Summary */}
            <Box mt={5} bgcolor="#f9f9f9" p={3} borderRadius={2}>
              <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                Interview Summary
              </Typography>
              <Typography>Date: {selectedDate?.toDateString() || 'N/A'}</Typography>
              <Typography>Time: {selectedTime || 'N/A'}</Typography>
              <Typography>Interviewer: {selectedInterviewer || 'N/A'}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  </LocalizationProvider>
);
}