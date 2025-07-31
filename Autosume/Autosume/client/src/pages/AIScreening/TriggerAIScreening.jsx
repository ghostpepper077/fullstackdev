import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import {
  Box,
  Typography,
  Paper,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  Avatar,
  Divider
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  AutoAwesome as AutoAwesomeIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import http from '../../http';

export default function TriggerAIScreening() {
  const [criteriaList, setCriteriaList] = useState([]);
  const [criteriaLoading, setCriteriaLoading] = useState(false);
  const [criteriaError, setCriteriaError] = useState(null);
  const [criteriaDialogOpen, setCriteriaDialogOpen] = useState(false);
  const [criteriaForm, setCriteriaForm] = useState({ jobId: '', experience: '', skills: [] });
  const [criteriaSkillsInput, setCriteriaSkillsInput] = useState('');
  const [state, setState] = useState({
    loading: false,
    error: null,
    success: null,
    jobs: [],
    jobId: '',
    experience: '',
    skills: [],
    resumeData: null,
    fileUploading: false,
    fileName: '',
    screeningResults: null,
    showResults: false,
    refreshingJobs: false
  });

  // Fetch jobs from database
  const fetchJobs = async () => {
    try {
      setState(prev => ({ ...prev, refreshingJobs: true, error: null }));
      const response = await http.get('/jobs');
      setState(prev => ({
        ...prev,
        jobs: response.data,
        refreshingJobs: false,
        jobId: response.data[0]?._id || ''
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: {
          message: 'Failed to fetch jobs',
          details: err.response?.data?.message || 'Please try again later'
        },
        refreshingJobs: false
      }));
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchCriteria();
  }, []);

  // Fetch criteria for selected job
  const fetchCriteria = async () => {
    try {
      setCriteriaLoading(true);
      const response = await http.get('/criteria');
      setCriteriaList(response.data);
    } catch (err) {
      setCriteriaError('Failed to fetch criteria. ' + (err.response?.data?.message || ''));
    } finally {
      setCriteriaLoading(false);
    }
  };

    const handleSaveCriteria = async () => {
    if (!criteriaForm.jobId || !criteriaForm.experience || criteriaForm.skills.length === 0) {
      setCriteriaError('Please fill all fields and add at least one skill');
      return;
    }

    setCriteriaLoading(true);
    try {
      const response = await http.post('/criteria', criteriaForm);
      setCriteriaList(prev => [...prev, response.data]);
      setCriteriaDialogOpen(false);
      setCriteriaError(null);
    } catch (err) {
      setCriteriaError('Failed to save criteria. ' + (err.response?.data?.message || ''));
    } finally {
      setCriteriaLoading(false);
    }
  };

  // Filter criteria for selected job
  const selectedJobCriteria = criteriaList.filter(c => c.jobId === state.jobId || c.jobId?._id === state.jobId);

  // Criteria dialog handlers
  const handleOpenCriteriaDialog = () => {
    setCriteriaForm({ jobId: state.jobId, experience: '', skills: [] });
    setCriteriaSkillsInput('');
    setCriteriaDialogOpen(true);
  };
  const handleCloseCriteriaDialog = () => {
    setCriteriaDialogOpen(false);
  };
  const handleCriteriaSkillsChange = (e) => {
    const value = e.target.value;
    if (value.endsWith(',') || value.endsWith(' ')) {
      const newSkill = value.slice(0, -1).trim();
      if (newSkill && !criteriaForm.skills.includes(newSkill)) {
        setCriteriaForm({ ...criteriaForm, skills: [...criteriaForm.skills, newSkill] });
        setCriteriaSkillsInput('');
        return;
      }
    }
    setCriteriaSkillsInput(value);
  };
  const handleRemoveCriteriaSkill = (skillToRemove) => {
    setCriteriaForm({ ...criteriaForm, skills: criteriaForm.skills.filter(skill => skill !== skillToRemove) });
  };

  const [saveLoading, setSaveLoading] = useState(false);

const handleSaveCandidates = async () => {
  if (!state.screeningResults) {
    setState(prev => ({ ...prev, error: { message: 'No screening results to save' } }));
    return;
  }

  setSaveLoading(true);
  try {
    const results = Array.isArray(state.screeningResults.results)
      ? state.screeningResults.results
      : [state.screeningResults];

    const saveResponse = await http.post('/screened-candidates', {
      candidates: results.map(result => ({
        ...result,
        jobId: state.jobId,
        role: state.jobs.find(j => j._id === state.jobId)?.role || 'Unknown'
      }))
    });

    setState(prev => ({
      ...prev,
      success: `Successfully saved ${saveResponse.data.count} candidates to shortlist!`
    }));
  } catch (err) {
    setState(prev => ({
      ...prev,
      error: {
        message: 'Failed to save candidates',
        details: err.response?.data?.message || 'Please try again'
      }
    }));
  } finally {
    setSaveLoading(false);
  }
};

// Add this button to your results section (after the screening results display)
{state.showResults && (
  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
    <Button
      variant="contained"
      color="secondary"
      onClick={handleSaveCandidates}
      disabled={saveLoading || !state.screeningResults}
      startIcon={saveLoading ? <CircularProgress size={20} /> : null}
    >
      {saveLoading ? 'Saving...' : 'Save to Shortlist'}
    </Button>
  </Box>
)}
  
  useEffect(() => {
    fetchJobs();
    fetchCriteria();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setState(prev => ({
      ...prev,
      fileUploading: true,
      error: null,
      fileName: file.name
    }));

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await http.post('/process-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000
      });

      // If multiple candidates detected, don't require top-level skills/experience
      let skills = response.data.data.skills || [];
      let experience = response.data.data.experience || '';
      if (Array.isArray(response.data.data.candidates) && response.data.data.candidates.length > 0) {
        // Use first candidate for preview, but show all in preview section
        skills = response.data.data.candidates[0].skills || skills;
        experience = response.data.data.candidates[0].experience || experience;
      }
      setState(prev => ({
        ...prev,
        skills,
        experience,
        resumeData: response.data.data, // Save resume data here
        fileUploading: false,
        success: 'Resume processed successfully!'
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: {
          message: 'Upload failed',
          details: error.response?.data?.details || error.message,
          suggestion: error.response?.data?.suggestion || 'Please try again'
        },
        fileUploading: false
      }));
    }
  };

// In TriggerAIScreening.jsx, update the handleRunScreening function:
const handleRunScreening = async () => {
  if (!state.jobId || state.skills.length === 0) {
    setState(prev => ({
      ...prev,
      error: {
        message: 'Missing information',
        details: 'Please select a job and ensure skills were detected'
      }
    }));
    return;
  }

  setState(prev => ({ ...prev, loading: true, error: null }));

  try {
    let candidates = [];
    if (Array.isArray(state.resumeData?.candidates)) {
      candidates = state.resumeData.candidates;
    } else if (state.resumeData) {
      candidates = [{
        name: state.resumeData.name || '',
        email: state.resumeData.email || '',
        phone: state.resumeData.phone || '',
        education: state.resumeData.education || '',
        summary: state.resumeData.summary || '',
        skills: state.skills,
        experience: state.experience
      }];
    }

    // First screen the candidates
    const screeningResponse = await http.post('/screen', {
      jobId: state.jobId,
      candidates
    });

    // Then save the screened candidates to database
    const saveResponse = await http.post('/screened-candidates', {
      candidates: screeningResponse.data.results.map(result => ({
        ...result,
        jobId: state.jobId,
        role: state.jobs.find(j => j._id === state.jobId)?.role || 'Unknown',
        status: 'Screened',
        dateScreened: new Date().toISOString()
      }))
    });

    setState(prev => ({
      ...prev,
      loading: false,
      success: `Screening completed and ${saveResponse.data.total} candidates saved to shortlist!`,
      screeningResults: screeningResponse.data,
      showResults: true
    }));

  } catch (err) {
    setState(prev => ({
      ...prev,
      loading: false,
      error: {
        message: 'Screening failed',
        details: err.response?.data?.error || 'Please try again'
      }
    }));
  }
};

  const removeSkill = (skillToRemove) => {
    setState(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const clearAll = () => {
    setState(prev => ({
      ...prev,
      jobId: prev.jobs[0]?._id || '',
      experience: '',
      skills: [],
      resumeData: null,
      fileName: '',
      screeningResults: null,
      showResults: false,
      error: null,
      success: null
    }));
  };

  // Safe access screeningResults.results with default empty array
  // Support both array and single object responses from backend
  const results = Array.isArray(state.screeningResults?.results)
    ? state.screeningResults.results
    : state.screeningResults
      ? [state.screeningResults]
      : [];

  return (
    <Paper sx={{ p: 4, maxWidth: '1200px', margin: 'auto', borderRadius: 3 }}>
      {/* Criteria Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 1 }}>
          Criteria for Selected Job
        </Typography>
        {criteriaLoading ? (
          <CircularProgress size={20} />
        ) : selectedJobCriteria.length > 0 ? (
          selectedJobCriteria.map((c, idx) => (
            <Paper key={idx} sx={{ p: 2, mb: 1, background: '#f5f5f5' }}>
              <Typography variant="subtitle2">Experience: {c.experience}</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {c.skills.map((skill, i) => (
                  <Chip key={i} label={skill} size="small" />
                ))}
              </Box>
            </Paper>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">No criteria set for this job.</Typography>
        )}
      </Box>

      {/* Criteria Dialog */}
      <Dialog open={criteriaDialogOpen} onClose={handleCloseCriteriaDialog}>
        <DialogTitle>Add Criteria</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Experience</InputLabel>
            <TextField
              label="Experience"
              value={criteriaForm.experience}
              onChange={e => setCriteriaForm({ ...criteriaForm, experience: e.target.value })}
              fullWidth
            />
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Skills</InputLabel>
            <TextField
              label="Skills (comma or space separated)"
              value={criteriaSkillsInput}
              onChange={handleCriteriaSkillsChange}
              fullWidth
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {criteriaForm.skills.map((skill, i) => (
                <Chip key={i} label={skill} onDelete={() => handleRemoveCriteriaSkill(skill)} size="small" />
              ))}
            </Box>
          </FormControl>
          {criteriaError && <Alert severity="error" sx={{ mt: 2 }}>{criteriaError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCriteriaDialog}>Cancel</Button>
          <Button onClick={handleSaveCriteria} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          AI Resume Screening
        </Typography>

      </Box>

      {/* Error Display */}
      {state.error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setState(prev => ({ ...prev, error: null }))}
        >
          <Typography fontWeight="bold">{state.error.message}</Typography>
          {state.error.details && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {state.error.details}
            </Typography>
          )}
          {state.error.fileName && (
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              File: {state.error.fileName}
            </Typography>
          )}
        </Alert>
      )}

      {/* Success Notification */}
      {state.success && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          onClose={() => setState(prev => ({ ...prev, success: null }))}
        >
          {state.success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Input Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 2 }}>
              Screening Parameters
            </Typography>

            {/* Job Selection */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Job Role *</InputLabel>
              <Select
                value={state.jobId}
                onChange={(e) => setState(prev => ({ ...prev, jobId: e.target.value }))}
                label="Job Role *"
                disabled={state.jobs.length === 0}
              >
                {state.jobs.length === 0 ? (
                  <MenuItem disabled>No jobs available</MenuItem>
                ) : (
                  state.jobs.map((job) => (
                    <MenuItem key={job._id} value={job._id}>
                      {job.role}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            {/* Resume Upload */}
            <Box sx={{ mb: 3 }}>
              <Button
                component="label"
                variant="contained"
                startIcon={<CloudUploadIcon />}
                disabled={state.fileUploading}
                fullWidth
              >
                {state.fileUploading ? 'Processing...' : 'Upload Resume'}
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                />
              </Button>
              {state.fileName && (
                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  {state.fileName}
                </Typography>
              )}
            </Box>

            {/* Detected Information */}
            {state.resumeData && (
              <>
                {Array.isArray(state.resumeData.candidates) && state.resumeData.candidates.length > 0 ? (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Detected Candidates:
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {state.resumeData.candidates.map((cand, idx) => (
                        <Paper key={idx} sx={{ p: 2, mb: 1, background: '#f5f5f5' }}>
                          <Typography variant="body2"><strong>Name:</strong> {cand.name || 'N/A'}</Typography>
                          <Typography variant="body2"><strong>Email:</strong> {cand.email || 'N/A'}</Typography>
                          <Typography variant="body2"><strong>Phone:</strong> {cand.phone || 'N/A'}</Typography>
                          <Typography variant="body2"><strong>Experience:</strong> {cand.experience || 'N/A'}</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                            {cand.skills && cand.skills.length > 0 ? cand.skills.map((skill, i) => (
                              <Chip key={i} label={skill} size="small" />
                            )) : <Typography variant="caption" color="text.disabled">No skills</Typography>}
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  </Box>
                ) : (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Detected Experience:
                      </Typography>
                      <Typography>{state.experience || 'Not specified'}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Detected Skills:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {state.skills.length > 0 ? (
                          state.skills.map((skill) => (
                            <Chip
                              key={skill}
                              label={skill}
                              onDelete={() => removeSkill(skill)}
                              size="small"
                            />
                          ))
                        ) : (
                          <Typography variant="caption" color="text.disabled">
                            No skills detected
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </>
                )}
              </>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                onClick={clearAll}
                startIcon={<DeleteIcon />}
              >
                Clear
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleRunScreening}
                disabled={
                  !state.jobId ||
                  state.skills.length === 0 ||
                  state.loading ||
                  state.fileUploading
                }
                startIcon={
                  state.loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <AutoAwesomeIcon />
                  )
                }
                sx={{ flexGrow: 1 }}
              >
                {state.loading ? 'Screening...' : 'Run AI Screening'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12} md={6}>
          {state.showResults ? (
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 2 }}>
                Screening Results
              </Typography>

              {results.length > 0 ? (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      {results.length}
                    </Avatar>
                    <Box>
                      <Typography>
                        <strong>
                          {state.jobs.find(j => j._id === state.jobId)?.role || 'Selected Job'}
                        </strong>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {results.filter(r => r.matchPercentage >= 80).length}{' '}
                        strong matches
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {results.slice(0, 5).map((result, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: 1,
                        backgroundColor: '#f9f9f9',
                        borderLeft: `4px solid ${
                          (result.match ?? 0) >= 80
                            ? '#4caf50'
                            : (result.match ?? 0) >= 60
                            ? '#ff9800'
                            : '#f44336'
                        }`
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                          {result.name}
                        </Typography>
                        <Chip
                          label={`${result.match ?? 0}%`}
                          size="small"
                          color={
                            (result.match ?? 0) >= 80
                              ? 'success'
                              : (result.match ?? 0) >= 60
                              ? 'warning'
                              : 'error'
                          }
                        />
                      </Box>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {result.summary}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Matching Skills:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {(result.matchedSkills ?? result.skills ?? []).slice(0, 5).map((skill, i) => (
                            <Chip key={i} label={skill} size="small" />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  ))}

                  {results.length > 5 && (
                    <Typography variant="caption" color="text.secondary">
                      Showing top 5 of {results.length} results
                    </Typography>
                  )}
                </>
              ) : (
                <Typography>No screening results found.</Typography>
              )}
            </Paper>
          ) : (
            <Paper
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                backgroundColor: '#f9f9f9'
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 60, color: 'action.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                {state.loading ? 'Processing...' : 'Results will appear here'}
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                Upload a resume and run screening to see candidate matches
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}
