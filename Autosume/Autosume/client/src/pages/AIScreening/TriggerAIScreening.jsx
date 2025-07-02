import React, { useState } from 'react';
import {
  Box, Typography, Paper, Grid, Select, MenuItem, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Link, IconButton, CircularProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FlagIcon from '@mui/icons-material/Flag';
import CancelIcon from '@mui/icons-material/Cancel';

// Mock data for the results table
const screeningResults = [
  { name: 'Audrey Hall', match: 92, skills: 'React, Node.js', status: 'AI Shortlisted' },
  { name: 'Dunn Smith', match: 84, skills: 'Degree', status: 'Under Review' },
  { name: 'Merlin Hermes', match: 72, skills: 'BSc in IT', status: 'Not matched' },
];

export default function TriggerAIScreening() {
  // State to manage the view
  const [isScreening, setIsScreening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Function to simulate running the AI screening
  const handleRunScreening = () => {
    setIsLoading(true);
    // In a real app, you would make an API call here.
    // We'll use a timeout to simulate the network request.
    setTimeout(() => {
      setIsLoading(false);
      setIsScreening(true);
    }, 2000); // Simulate a 2-second screening process
  };

  return (
    <Paper sx={{ p: 4, maxWidth: '1200px', margin: 'auto', borderRadius: 2 }}>
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        Trigger AI Resume Screening
      </Typography>
      
      {/* Job Criteria Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" gutterBottom>Job Role</Typography>
          <Select fullWidth defaultValue="Software Engineer">
            <MenuItem value="Software Engineer">Software Engineer</MenuItem>
            {/* Add other roles */}
          </Select>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" gutterBottom>Required Skills</Typography>
          <Select fullWidth defaultValue="React">
            <MenuItem value="React">React, Node.js, TypeScript</MenuItem>
            {/* Add other skill sets */}
          </Select>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" gutterBottom>Experience Required</Typography>
          <Select fullWidth defaultValue="3-5 years">
            <MenuItem value="1-3 years">1-3 years</MenuItem>
            <MenuItem value="3-5 years">3-5 years</MenuItem>
            <MenuItem value="5+ years">5+ years</MenuItem>
          </Select>
        </Grid>
      </Grid>
      
      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Button variant="contained" component="label">
          Upload Resumes
          <input type="file" hidden multiple />
        </Button>
        <Button variant="contained" color="primary" onClick={handleRunScreening} disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Run AI Screening'}
        </Button>
      </Box>

      {/* Conditional Rendering for Results */}
      {isScreening && (
        <Box>
          <Typography variant="body1" sx={{ mb: 2, p: 2, backgroundColor: '#f0f4f8', borderRadius: 1 }}>
            AI screened <strong>50 resumes</strong>: Top <strong>10</strong> matches scored above 90%. <strong>3</strong> resumes flagged for manual reviews.
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Candidate</strong></TableCell>
                  <TableCell><strong>Match %</strong></TableCell>
                  <TableCell><strong>Skills Matched</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {screeningResults.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>
                      <Chip label={`${row.match}%`} color={row.match > 90 ? "success" : "default"} />
                    </TableCell>
                    <TableCell>{row.skills}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell align="center">
                      <Link href="#" sx={{ mr: 2 }}>View</Link>
                      <IconButton size="small" color="success">
                        <CheckCircleIcon />
                      </IconButton>
                      <IconButton size="small" color="warning">
                        <FlagIcon />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <CancelIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Paper>
  );
}