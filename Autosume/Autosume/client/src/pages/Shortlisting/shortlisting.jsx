import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Select, MenuItem, Button, Grid, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert
} from '@mui/material';
import http from '../../http'; // Your pre-configured http client

export default function Shortlisting() {
  const navigate = useNavigate();
  
  // State for fetched data, loading, and errors
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    jobRole: 'Software Engineer',
    status: 'Under Review',
    experience: '>5 months',
    skills: 'Any',
  });

  // Fetch candidates from the database when the component loads
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        // ===================================================================
        // This endpoint must be set up on your server to return the candidates
        // e.g., app.get('/candidates', (req, res) => { ... });
        const response = await http.get('/candidates');
        // ===================================================================
        
        setCandidates(response.data);
        // Set the first candidate as selected by default if data exists
        if (response.data && response.data.length > 0) {
          setSelectedCandidate(response.data[0]);
        }
      } catch (err) {
        setError('Failed to fetch candidates. Please ensure the server is running and the API endpoint is correct.');
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []); // The empty array ensures this effect runs only once on component mount

  // Display a loading spinner while fetching data
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Candidates...</Typography>
      </Box>
    );
  }

  // Display an error message if the fetch fails
  if (error) {
    return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;
  }

  return (
    <Box sx={{ flex: 1, p: 4, overflowY: 'auto', backgroundColor: '#fdfdfd' }}>
      {/* Top Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Resume Shortlisting</Typography>
        <Typography>Hariz</Typography> {/* Replace with dynamic user name if needed */}
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <Select size="small" value={filters.jobRole} onChange={(e) => setFilters({ ...filters, jobRole: e.target.value })}>
          <MenuItem value="Software Engineer">Software Engineer</MenuItem>
        </Select>
        {/* Add other filters as needed */}
        <Button variant="outlined" onClick={() => navigate('/create-criteria')}>+ ADD CRITERIA</Button>
      </Box>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Candidate Table */}
        <Grid item xs={12} lg={7}>
          <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Candidate</strong></TableCell>
                  <TableCell><strong>Match %</strong></TableCell>
                  <TableCell><strong>Key Skills</strong></TableCell>
                  <TableCell><strong>Experience</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {candidates.map((candidate) => (
                  <TableRow
                    key={candidate._id} // Use MongoDB's unique _id for the key
                    onClick={() => setSelectedCandidate(candidate)}
                    hover
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: selectedCandidate && candidate._id === selectedCandidate._id ? '#f5f5f5' : 'transparent'
                    }}
                  >
                    <TableCell>{candidate.name}</TableCell>
                    <TableCell sx={{ color: candidate.match >= 90 ? 'green' : 'inherit', fontWeight: 'medium' }}>{candidate.match}%</TableCell>
                    <TableCell>{candidate.skills.join(', ')}</TableCell>
                    <TableCell>{candidate.experience}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Candidate Detail View */}
        <Grid item xs={12} lg={5}>
          {selectedCandidate ? (
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold">{selectedCandidate.name}</Typography>
              <Typography color="text.secondary">{selectedCandidate.phone}</Typography>
              <Typography color="text.secondary" gutterBottom>{selectedCandidate.email}</Typography>

              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>Overview</Typography>
              <Typography variant="body2">{selectedCandidate.overview}</Typography>

              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>Experience</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{selectedCandidate.experienceDetails}</Typography>

              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>Education</Typography>
              <Typography variant="body2">{selectedCandidate.education}</Typography>

              <Button variant="contained" sx={{ mt: 3, textTransform: 'none', fontWeight: 'bold' }}>
                View Full Resume
              </Button>
            </Paper>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography>No candidates found or select a candidate to see details.</Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* AI Summary Section */}
      {selectedCandidate && (
        <Paper elevation={2} sx={{ mt: 3, p: 3, backgroundColor: '#f0f4f8', borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>AI Summary 🤖</Typography>
          <Typography variant="body2">{selectedCandidate.aiSummary}</Typography>
        </Paper>
      )}
    </Box>
  );
} 