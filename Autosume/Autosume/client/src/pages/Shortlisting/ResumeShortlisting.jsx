// client/src/pages/ResumeShortlisting.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Dialog, DialogTitle,
  DialogContent, DialogActions, CircularProgress, Alert,
  FormControl, InputLabel, Select, MenuItem, Grid, Chip,
  IconButton
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FlagIcon from '@mui/icons-material/Flag';
import CancelIcon from '@mui/icons-material/Cancel';
import http from '../../http';
import CandidateDetails from '../../components/CandidateDetails';

export default function ResumeShortlisting() {
  // Flow control states
  const [step, setStep] = useState('upload'); // 'upload' | 'processing' | 'results' | 'overview'
  const [openOverview, setOpenOverview] = useState(false);
  
  // File and processing states
  const [resumeFiles, setResumeFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  // Job criteria state
  const [jobCriteria, setJobCriteria] = useState({
    role: 'Software Engineer',
    skills: 'React, Node.js, TypeScript',
    experience: '3-5 years'
  });

  // Results state
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [filterOptions, setFilterOptions] = useState({ experience: [], skills: [], jobs: [] });
  const [filters, setFilters] = useState({
    jobRole: 'Any',
    status: 'Under Review',
    experience: 'Any',
    skills: 'Any',
  });

  // Fetch filter options when results are shown
  useEffect(() => {
    if (step === 'results' && candidates.length > 0) {
      const fetchOptions = async () => {
        try {
          const response = await http.get('/criteria/options');
          setFilterOptions(response.data);
        } catch (err) {
          setError('Failed to load filter options');
        }
      };
      fetchOptions();
    }
  }, [step, candidates]);

  // Handle file upload
  const handleFileChange = (e) => {
    setResumeFiles([...e.target.files]);
  };

  // Run AI screening
  const handleRunScreening = async () => {
    if (resumeFiles.length === 0) {
      setError('Please upload at least one resume');
      return;
    }

    setIsProcessing(true);
    setStep('processing');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('role', jobCriteria.role);
      formData.append('skills', jobCriteria.skills);
      formData.append('experience', jobCriteria.experience);
      resumeFiles.forEach(file => formData.append('resumes', file));

      const response = await http.post('/api/ai/process-resumes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setCandidates(response.data);
      setStep('results');
    } catch (err) {
      setError('Failed to process resumes. Please try again.');
      setStep('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter candidates based on criteria
  const filteredCandidates = candidates.filter(candidate => {
    return (
      (filters.jobRole === 'Any' || candidate.jobRole === filters.jobRole) &&
      (filters.experience === 'Any' || candidate.experience === filters.experience) &&
      (filters.skills === 'Any' || candidate.skills.includes(filters.skills))
  )});

  // Get match style for chips
  const getMatchStyle = (match) => {
    if (match >= 90) return 'success';
    if (match >= 70) return 'primary';
    return 'default';
  };

  return (
    <Box sx={{ p: 4, backgroundColor: '#fdfdfd' }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        AI Resume Shortlisting
      </Typography>

      {/* Upload and Criteria Section */}
      {step === 'upload' && (
        <Paper sx={{ p: 4, mb: 4, borderRadius: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Job Role</InputLabel>
                <Select
                  value={jobCriteria.role}
                  onChange={(e) => setJobCriteria({...jobCriteria, role: e.target.value})}
                  label="Job Role"
                >
                  <MenuItem value="Software Engineer">Software Engineer</MenuItem>
                  <MenuItem value="Frontend Developer">Frontend Developer</MenuItem>
                  <MenuItem value="Backend Developer">Backend Developer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Required Skills</InputLabel>
                <Select
                  value={jobCriteria.skills}
                  onChange={(e) => setJobCriteria({...jobCriteria, skills: e.target.value})}
                  label="Required Skills"
                >
                  <MenuItem value="React, Node.js, TypeScript">React, Node.js, TypeScript</MenuItem>
                  <MenuItem value="Python, Django, Flask">Python, Django, Flask</MenuItem>
                  <MenuItem value="Java, Spring, Hibernate">Java, Spring, Hibernate</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Experience</InputLabel>
                <Select
                  value={jobCriteria.experience}
                  onChange={(e) => setJobCriteria({...jobCriteria, experience: e.target.value})}
                  label="Experience"
                >
                  <MenuItem value="1-3 years">1-3 years</MenuItem>
                  <MenuItem value="3-5 years">3-5 years</MenuItem>
                  <MenuItem value="5+ years">5+ years</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="contained"
              component="label"
              startIcon={<CloudUploadIcon />}
            >
              Upload Resumes
              <input
                type="file"
                hidden
                multiple
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
            </Button>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {resumeFiles.length > 0 && (
                <Typography variant="body2">
                  {resumeFiles.length} file{resumeFiles.length !== 1 ? 's' : ''} selected
                </Typography>
              )}
              <Button
                variant="contained"
                color="primary"
                onClick={handleRunScreening}
                disabled={isProcessing || resumeFiles.length === 0}
              >
                {isProcessing ? <CircularProgress size={24} /> : 'Run AI Screening'}
              </Button>
            </Box>
          </Box>

          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </Paper>
      )}

      {/* Processing Screen */}
      {step === 'processing' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 8 }}>
          <CircularProgress size={80} thickness={4} sx={{ mb: 3 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>AI Screening in Progress</Typography>
          <Typography variant="body1" color="text.secondary">
            Analyzing {resumeFiles.length} resume{resumeFiles.length !== 1 ? 's' : ''}...
          </Typography>
        </Box>
      )}

      {/* Results Section */}
      {step === 'results' && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6">
              Showing {candidates.length} result{candidates.length !== 1 ? 's' : ''}
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => setOpenOverview(true)}
            >
              Show Overview
            </Button>
          </Box>

          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Candidate</strong></TableCell>
                  <TableCell><strong>Match %</strong></TableCell>
                  <TableCell><strong>Skills</strong></TableCell>
                  <TableCell><strong>Experience</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {candidates.map((candidate) => (
                  <TableRow
                    key={candidate._id}
                    hover
                    onClick={() => setSelectedCandidate(candidate)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{candidate.name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={`${candidate.match}%`} 
                        color={getMatchStyle(candidate.match)}
                      />
                    </TableCell>
                    <TableCell>{candidate.skills.join(', ')}</TableCell>
                    <TableCell>{candidate.experience}</TableCell>
                    <TableCell>
                      {candidate.match >= 90 ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                          <CheckCircleIcon fontSize="small" sx={{ mr: 0.5 }} />
                          Top Match
                        </Box>
                      ) : candidate.match >= 70 ? (
                        'Under Review'
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
                          <CancelIcon fontSize="small" sx={{ mr: 0.5 }} />
                          Not Matched
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Overview Dialog */}
      <Dialog 
        open={openOverview} 
        onClose={() => setOpenOverview(false)}
        fullWidth
        maxWidth="xl"
      >
        <DialogTitle>Resume Shortlisting Overview</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 3 }}>
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
                  {filterOptions.jobs?.map((job) => (
                    <MenuItem key={job._id} value={job._id}>{job.role}</MenuItem>
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
                  {filterOptions.experience?.map((exp) => (
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
                  {filterOptions.skills?.map((skill) => (
                    <MenuItem key={skill} value={skill}>{skill}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button variant="outlined" onClick={() => {}}>
                + ADD CRITERIA
              </Button>
            </Box>

            {/* Results Grid */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Candidate</strong></TableCell>
                        <TableCell><strong>Match %</strong></TableCell>
                        <TableCell><strong>Skills</strong></TableCell>
                        <TableCell><strong>Experience</strong></TableCell>
                        <TableCell align="right"><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredCandidates.map((candidate) => (
                        <TableRow
                          key={candidate._id}
                          hover
                          onClick={() => setSelectedCandidate(candidate)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>{candidate.name}</TableCell>
                          <TableCell>
                            <Chip 
                              label={`${candidate.match}%`} 
                              color={getMatchStyle(candidate.match)}
                            />
                          </TableCell>
                          <TableCell>{candidate.skills.join(', ')}</TableCell>
                          <TableCell>{candidate.experience}</TableCell>
                          <TableCell align="right">
                            <IconButton size="small" color="warning">
                              <FlagIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              <Grid item xs={12} md={5}>
                {selectedCandidate ? (
                  <CandidateDetails candidate={selectedCandidate} />
                ) : (
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography>Select a candidate to view details</Typography>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOverview(false)}>Close</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setOpenOverview(false);
              setStep('upload');
            }}
          >
            Start New Screening
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}