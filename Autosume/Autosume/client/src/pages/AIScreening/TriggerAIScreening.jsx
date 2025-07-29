import React, { useState, useEffect } from 'react';
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

      if (!response.data?.data?.skills || !response.data?.data?.experience) {
        throw new Error("Invalid server response format");
      }

      setState(prev => ({
        ...prev,
        skills: response.data.data.skills,
        experience: response.data.data.experience,
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
      const response = await http.post('/screen', {
        jobId: state.jobId,
        skills: state.skills,
        experience: state.experience,
        resumeText: state.resumeData?.resumeText || ''
      });

      setState(prev => ({
        ...prev,
        loading: false,
        success: `Screening completed against ${state.jobs.find(j => j._id === state.jobId)?.role || 'selected job'}`,
        screeningResults: response.data,
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          AI Resume Screening
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchJobs}
          disabled={state.refreshingJobs}
        >
          {state.refreshingJobs ? 'Refreshing...' : 'Refresh Jobs'}
        </Button>
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
                          result.matchPercentage >= 80
                            ? '#4caf50'
                            : result.matchPercentage >= 60
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
                          label={`${result.matchPercentage}%`}
                          size="small"
                          color={
                            result.matchPercentage >= 80
                              ? 'success'
                              : result.matchPercentage >= 60
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
                          {result.matchedSkills?.slice(0, 5).map((skill, i) => (
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
