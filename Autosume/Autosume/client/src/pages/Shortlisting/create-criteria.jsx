import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, TextField, Button } from '@mui/material';

// Add "export default" here
export default function CreateCriteria() {
  const navigate = useNavigate();

  const handleSave = () => {
    // Placeholder functionality
    alert('AI Criteria Saved! (Functionality to be implemented)');
    navigate('/shortlisting');
  };

  return (
    <Box p={4} bgcolor="#f5f5f5" minHeight="100vh">
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Create AI Screening Criteria
      </Typography>
      <Paper elevation={3} sx={{ p: 4, maxWidth: '800px', mx: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          Define Job Role Criteria
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Enter the key requirements, skills, and qualifications for the job role. The AI will use this to screen and match resumes.
        </Typography>
        
        <TextField
          label="Job Role"
          fullWidth
          defaultValue="Software Engineer"
          sx={{ mb: 3 }}
        />
        
        <TextField
          label="Screening Criteria"
          multiline
          rows={10}
          fullWidth
          placeholder="e.g., Must have at least 3 years of experience with React and Node.js. Experience with cloud platforms like AWS is a plus. Bachelor's degree in Computer Science is required."
          sx={{ mb: 3 }}
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate('/shortlisting')}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save Criteria
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}