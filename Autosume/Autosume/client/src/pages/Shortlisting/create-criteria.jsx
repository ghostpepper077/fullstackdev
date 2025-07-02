import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
  Alert
} from '@mui/material';
import http from '../../http'; // Assuming you use the same http client from App.jsx

export default function CreateCriteria() {
  // State to hold the list of jobs fetched from the database
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // State for the form fields
  const [formData, setFormData] = useState({
    jobId: '',
    experience: '',
    skills: ''
  });

  // Fetch jobs from the database when the component loads
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // ===================================================================
        // TODO: Replace with your actual API endpoint to get jobs
        // This endpoint should return an array of objects, e.g., [{ _id: '1', title: 'Software Engineer' }, ...]
        const response = await http.get('/jobs'); 
        setJobs(response.data);
        // ===================================================================

      } catch (err) {
        setError('Failed to fetch job roles. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []); // Empty array ensures this runs only once on mount

  // Handle changes in form inputs
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!formData.jobId || !formData.experience || !formData.skills) {
      setError('All fields are required.');
      return;
    }

    try {
      // ===================================================================
      // TODO: Replace with your actual API endpoint to create criteria
      // This will send the form data to your backend to be saved in MongoDB
      const response = await http.post('/criteria', formData);
      // ===================================================================
      
      setSuccess('Criteria created successfully!');
      // Optionally, reset the form
      setFormData({ jobId: '', experience: '', skills: '' });

    } catch (err) {
      setError('Failed to create criteria. Please try again.');
      console.error(err);
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: '900px', margin: 'auto', borderRadius: 2 }}>
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        Create Job Criteria
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Define role requirements to guide AI-driven resume matching.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="job-role-label">Job Role</InputLabel>
              <Select
                labelId="job-role-label"
                id="jobId"
                name="jobId"
                value={formData.jobId}
                label="Job Role"
                onChange={handleChange}
                disabled={loading}
              >
                {loading ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} /> Loading jobs...
                  </MenuItem>
                ) : (
                  jobs.map((job) => (
                    // Assuming job object has `_id` and `title` properties from MongoDB
                    <MenuItem key={job._id} value={job._id}>
                      {job.title}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              id="experience"
              name="experience"
              label="Experience Required"
              variant="outlined"
              value={formData.experience}
              onChange={handleChange}
              placeholder="e.g., 3-5 years"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              id="skills"
              name="skills"
              label="Required Skills"
              variant="outlined"
              multiline
              rows={4}
              value={formData.skills}
              onChange={handleChange}
              placeholder="Enter skills, separated by commas (e.g., React, Node.js, MongoDB)"
            />
          </Grid>

          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="contained" size="large">
              Submit
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}