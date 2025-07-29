import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Select, MenuItem, Button, Grid, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert, FormControl, InputLabel
} from '@mui/material';
import http from '../../http';

export default function Shortlisting() {
  const navigate = useNavigate();
  
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fallback filter options in case API fails
  const [filterOptions, setFilterOptions] = useState({ 
    experience: ['0-1 years', '1-3 years', '3-5 years', '5+ years'],
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS'],
    jobs: ['Frontend Developer', 'Backend Developer', 'DevOps Engineer']
  });

  const [filters, setFilters] = useState({
    jobRole: 'Any',
    status: 'Under Review',
    experience: 'Any',
    skills: 'Any',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch data from API, but fallback to local data if it fails
        const [candidatesRes, optionsRes] = await Promise.all([
          http.get('/candidates').catch(() => ({ data: [] })),
          http.get('/criteria/options').catch(() => ({ 
            data: {
              experience: filterOptions.experience,
              skills: filterOptions.skills,
              jobs: filterOptions.jobs
            }
          }))
        ]);
        
        setCandidates(candidatesRes.data || []);
        
        // Merge API response with fallback options
        setFilterOptions({
          experience: optionsRes.data?.experience || filterOptions.experience,
          skills: optionsRes.data?.skills || filterOptions.skills,
          jobs: optionsRes.data?.jobs || filterOptions.jobs
        });

        if (candidatesRes.data && candidatesRes.data.length > 0) {
          setSelectedCandidate(candidatesRes.data[0]);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to fetch page data. Using fallback data instead.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, p: 4, overflowY: 'auto', backgroundColor: '#fdfdfd' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Resume Shortlisting</Typography>
      </Box>

      {error && <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Filter Bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Job Role</InputLabel>
          <Select
            label="Job Role"
            value={filters.jobRole}
            onChange={(e) => setFilters({ ...filters, jobRole: e.target.value })}
          >
            <MenuItem value="Any">Any Job Role</MenuItem>
            {filterOptions.jobs.map((job) => {
              // If job is an object (from API), use job.role and job._id
              if (typeof job === 'object' && job !== null && 'role' in job) {
                return (
                  <MenuItem key={job._id || job.role} value={job._id}>
                    {job.role}
                  </MenuItem>
                );
              }
              // Fallback for string jobs (from local fallback)
              return (
                <MenuItem key={job} value={job}>
                  {job}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Experience</InputLabel>
          <Select
            label="Experience"
            value={filters.experience}
            onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
          >
            <MenuItem value="Any">Any</MenuItem>
            {filterOptions.experience.map((exp) => (
              <MenuItem key={exp} value={exp}>{exp}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Skills</InputLabel>
          <Select
            label="Skills"
            value={filters.skills}
            onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
          >
            <MenuItem value="Any">Any</MenuItem>
            {filterOptions.skills.map((skill) => (
              <MenuItem key={skill} value={skill}>{skill}</MenuItem>
            ))}
          </Select>
        </FormControl>

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
                {candidates.length > 0 ? (
                  candidates.map((candidate) => (
                    <TableRow
                      key={candidate._id || candidate.name}
                      onClick={() => setSelectedCandidate(candidate)}
                      hover
                      sx={{
                        cursor: 'pointer',
                        backgroundColor: selectedCandidate && candidate._id === selectedCandidate?._id ? '#f5f5f5' : 'transparent'
                      }}
                    >
                      <TableCell>{candidate.name}</TableCell>
                      <TableCell sx={{ color: candidate.match >= 90 ? 'green' : 'inherit', fontWeight: 'medium' }}>
                        {candidate.match}%
                      </TableCell>
                      <TableCell>{Array.isArray(candidate.skills) ? candidate.skills.join(', ') : candidate.skills}</TableCell>
                      <TableCell>{candidate.experience}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No candidates found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Candidate Detail View */}
        <Grid item xs={12} lg={5}>
          {selectedCandidate ? (
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold">{selectedCandidate.name}</Typography>
              <Typography color="text.secondary">{selectedCandidate.phone || 'No phone provided'}</Typography>
              <Typography color="text.secondary" gutterBottom>{selectedCandidate.email || 'No email provided'}</Typography>
              
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>Overview</Typography>
              <Typography variant="body2">{selectedCandidate.overview || 'No overview available'}</Typography>
              
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>Experience</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {selectedCandidate.experienceDetails || 'No experience details available'}
              </Typography>
              
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>Education</Typography>
              <Typography variant="body2">{selectedCandidate.education || 'No education information available'}</Typography>
              
              <Button variant="contained" sx={{ mt: 3 }}>View Full Resume</Button>
            </Paper>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography>Select a candidate to see details</Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* AI Summary Section */}
      {selectedCandidate?.aiSummary && (
        <Paper elevation={2} sx={{ mt: 3, p: 3, backgroundColor: '#f0f4f8', borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>AI Summary 🤖</Typography>
          <Typography variant="body2">{selectedCandidate.aiSummary}</Typography>
        </Paper>
      )}
    </Box>
  );
}