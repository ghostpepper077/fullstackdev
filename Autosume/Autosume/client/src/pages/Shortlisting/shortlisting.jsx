import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Select, MenuItem, Button, Grid, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert, FormControl, InputLabel, TextField,
  Chip, Avatar, TablePagination
} from '@mui/material';
import http from '../../http';

export default function Shortlisting() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter options and state
  const [filterOptions, setFilterOptions] = useState({
    experience: [],
    skills: [],
    jobs: []
  });

  const [filters, setFilters] = useState({
    jobRole: 'Any',
    status: 'Screened',
    experience: 'Any',
    skills: 'Any',
  });

  // Fetch all data on initial load
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch jobs for job role filter
        const jobsResponse = await http.get('/jobs');
        setFilterOptions(prev => ({
          ...prev,
          jobs: jobsResponse.data.map(job => job.role)
        }));
        
        // Fetch criteria for experience and skills filters
        const criteriaResponse = await http.get('/criteria');
        const experiences = [...new Set(criteriaResponse.data.map(c => c.experience).filter(Boolean))];
        const skills = [...new Set(criteriaResponse.data.flatMap(c => c.skills).filter(Boolean))];
        setFilterOptions(prev => ({
          ...prev,
          experience: experiences,
          skills: skills
        }));
        
        // Fetch screened candidates
        const candidatesResponse = await http.get('/screened-candidates');
        setCandidates(candidatesResponse.data);
        setFilteredCandidates(candidatesResponse.data);
        
      } catch (err) {
        console.error('Initial data fetch error:', err);
        setError('Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Apply filters whenever filters or search term changes
// inside useEffect where filtering happens:
useEffect(() => {
  if (candidates.length === 0) return;

  let filtered = [...candidates];

  // Job Role filter
  if (filters.jobRole !== 'Any') {
    filtered = filtered.filter(candidate =>
      candidate.role === filters.jobRole
    );
  }

  // Experience filter
  if (filters.experience !== 'Any') {
    filtered = filtered.filter(candidate =>
      candidate.experience === filters.experience
    );
  }

  // Skills filter
  if (filters.skills !== 'Any') {
    filtered = filtered.filter(candidate =>
      candidate.skills &&
      candidate.skills.some(skill =>
        skill.toLowerCase() === filters.skills.toLowerCase()
      )
    );
  }

  // Search filter (Fix here ✅)
  if (searchTerm.trim()) {
    const searchLower = searchTerm.toLowerCase();
    filtered = filtered.filter(candidate =>
      candidate.name?.toLowerCase().includes(searchLower) ||
      candidate.email?.toLowerCase().includes(searchLower) ||
      (candidate.skills &&
        candidate.skills.some(skill =>
          skill.toLowerCase().includes(searchLower)
        ))
    );
  }

  setFilteredCandidates(filtered);
  setPage(0);
}, [filters, searchTerm, candidates]);


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
            {filterOptions.jobs.map((job, index) => (
              <MenuItem key={index} value={job}>{job}</MenuItem>
            ))}
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
            {filterOptions.experience.map((exp, index) => (
              <MenuItem key={index} value={exp}>{exp}</MenuItem>
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
            {filterOptions.skills.map((skill, index) => (
              <MenuItem key={index} value={skill}>{skill}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 250 }}
          placeholder="Search by name, email, or skills"
        />

        <Button variant="outlined" onClick={() => navigate('/create-criteria')}>
          + ADD CRITERIA
        </Button>
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredCandidates.length > 0 ? (
                  filteredCandidates
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((candidate) => (
                    <TableRow
                      key={`${candidate._id || candidate.email}`}
                      onClick={() => setSelectedCandidate(candidate)}
                      hover
                      sx={{
                        cursor: 'pointer',
                        backgroundColor: selectedCandidate?.email === candidate.email ? '#f5f5f5' : 'transparent'
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: getColorByScore(candidate.match || candidate.matchPercentage) }}>
                            {candidate.name?.charAt(0) || '?'}
                          </Avatar>
                          <Box>
                            <Typography>{candidate.name || 'Unknown'}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {candidate.email || 'No email'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${candidate.match || candidate.matchPercentage || 0}%`}
                          color={getColorByScore(candidate.match || candidate.matchPercentage || 0)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {(candidate.skills || []).slice(0, 3).map((skill, index) => (
                            <Chip key={`${skill}-${index}`} label={skill} size="small" />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>{candidate.experience || 'Not specified'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      {candidates.length === 0 ? 'No candidates available' : 'No matching candidates found'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredCandidates.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
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
              <Typography variant="body2">{selectedCandidate.summary || 'No overview available'}</Typography>
              
              
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>Education</Typography>
              <Typography variant="body2">{selectedCandidate.education || 'No education information available'}</Typography>
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

// Helper function for color coding
function getColorByScore(score) {
  const numScore = typeof score === 'number' ? score : parseInt(score) || 0;
  if (numScore >= 80) return 'success';
  if (numScore >= 60) return 'warning';
  return 'error';
}