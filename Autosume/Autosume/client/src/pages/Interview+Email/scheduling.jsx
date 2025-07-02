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
          candidate,
          interview: {
            date: selectedDate.toDateString(),
            time: selectedTime,
            interviewer: selectedInterviewer,
          },
        },
      });
    } else {
      alert('Please complete all fields.');
    }
  };

  if (!candidate) {
    return (
      <Box p={5}>
        <Typography variant="h6">No candidate selected.</Typography>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box p={5} bgcolor="#f5f5f5" minHeight="100vh">
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Schedule Interview
        </Typography>

        <Grid container spacing={4}>
          {/* Candidate Info */}
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6">{candidate.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {candidate.role}
              </Typography>
              <Typography variant="body2" mt={1}>
                {candidate.email}
              </Typography>
              <Typography variant="body2" mb={2}>
                {candidate.phone}
              </Typography>
              <Typography fontWeight="bold" mb={1}>
                Skills:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {candidate.skills?.map((s, i) => (
                  <Chip key={i} label={s} />
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Scheduling Form */}
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 4 }}>
              <Typography fontWeight="bold" mb={2}>
                Select Interview Date:
              </Typography>
              <DatePicker
                label="Pick a date"
                value={selectedDate}
                onChange={(newDate) => setSelectedDate(newDate)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />

              <Box mt={4}>
                <Typography fontWeight="bold" mb={2}>
                  Choose Time Slot:
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot}
                      variant={selectedTime === slot ? 'contained' : 'outlined'}
                      onClick={() => setSelectedTime(slot)}
                    >
                      {slot}
                    </Button>
                  ))}
                </Box>
              </Box>

              <Box mt={4}>
                <Typography fontWeight="bold" mb={1}>
                  Assign Interviewer:
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

              {/* Summary */}
              <Box mt={5}>
                <Typography variant="h6" fontWeight="bold">
                  Interview Summary
                </Typography>
                <Typography>
                  Candidate: <strong>{candidate.name}</strong>
                </Typography>
                <Typography>
                  Date: <strong>{selectedDate ? selectedDate.toDateString() : 'N/A'}</strong>
                </Typography>
                <Typography>
                  Time: <strong>{selectedTime || 'N/A'}</strong>
                </Typography>
                <Typography>
                  Interviewer: <strong>{selectedInterviewer || 'N/A'}</strong>
                </Typography>
              </Box>

              <Button
                variant="contained"
                sx={{ mt: 4 }}
                onClick={handleSchedule}
              >
                Schedule Interview
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
}
