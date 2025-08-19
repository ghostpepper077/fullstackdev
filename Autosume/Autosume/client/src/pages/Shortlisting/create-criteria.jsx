import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, 
  Alert, FormControl, InputLabel, Select, MenuItem, Chip, Snackbar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import http from '../../http';

export default function CreateCriteria() {
  const [criteriaList, setCriteriaList] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCriteria, setCurrentCriteria] = useState({ 
    id: null, 
    jobId: '', 
    experience: '', 
    skills: [] 
  });

  // Fetch all existing criteria
  const fetchCriteria = async () => {
    try {
      setLoading(true);
      const response = await http.get('/criteria');
      setCriteriaList(response.data);
    } catch (err) {
      setError('Failed to fetch criteria. ' + (err.response?.data?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  // Fetch jobs for the dropdown
  const fetchJobs = async () => {
    try {
      const response = await http.get('/jobs');
      setJobs(response.data);
    } catch (err) {
      setError('Failed to fetch job roles. ' + (err.response?.data?.message || ''));
    }
  };

  useEffect(() => {
    fetchCriteria();
    fetchJobs();
  }, []);

  // Dialog open/close handlers
  const handleOpen = (criteria = null) => {
    if (criteria) {
      setIsEditing(true);
      setCurrentCriteria({ 
        id: criteria._id, 
        jobId: criteria.jobId._id,
        experience: criteria.experience, 
        skills: criteria.skills
      });
    } else {
      setIsEditing(false);
      setCurrentCriteria({ id: null, jobId: '', experience: '', skills: [] });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Handle skills input
  const handleSkillsChange = (e) => {
    const value = e.target.value;
    // If last character is comma or space, add a new skill
    if (value.endsWith(',') || value.endsWith(' ')) {
      const newSkill = value.slice(0, -1).trim();
      if (newSkill && !currentCriteria.skills.includes(newSkill)) {
        setCurrentCriteria({
          ...currentCriteria,
          skills: [...currentCriteria.skills, newSkill],
          skillsInput: ''
        });
        return;
      }
    }
    // Otherwise just update the input field
    setCurrentCriteria({
      ...currentCriteria,
      skillsInput: value
    });
  };

  const removeSkill = (skillToRemove) => {
    setCurrentCriteria({
      ...currentCriteria,
      skills: currentCriteria.skills.filter(skill => skill !== skillToRemove)
    });
  };

  // CRUD operation handlers
  const handleSave = async () => {
    if (!currentCriteria.jobId || !currentCriteria.experience || currentCriteria.skills.length === 0) {
      setError('Please fill all required fields');
      return;
    }

    try {
      const { id, ...data } = currentCriteria;
      if (isEditing) {
        await http.put(`/criteria/${id}`, data);
        setSuccess('Criteria updated successfully');
      } else {
        await http.post('/criteria', data);
        setSuccess('Criteria created successfully');
      }
      fetchCriteria();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this criteria?')) {
      try {
        await http.delete(`/criteria/${id}`);
        setSuccess('Criteria deleted successfully');
        fetchCriteria();
      } catch (err) {
        setError(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box>
      {/* Notifications */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success">{success}</Alert>
      </Snackbar>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Manage Job Criteria</Typography>
        <Button 
          variant="contained" 
          onClick={() => handleOpen()}
          startIcon={<EditIcon />}
        >
          Add New Criteria
        </Button>
      </Box>

      {criteriaList.length === 0 && !loading ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>No criteria found. Create your first criteria to get started.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Job Role</strong></TableCell>
                <TableCell><strong>Experience Required</strong></TableCell>
                <TableCell><strong>Skills</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
  {criteriaList.map((item) => (
    <TableRow key={item._id} hover>
      <TableCell>{item.jobId?.role || 'N/A'}</TableCell>
      <TableCell>{item.experience}</TableCell>
      <TableCell>
        {item.skills.join(', ')}
      </TableCell>
      <TableCell align="right">
        <IconButton 
          onClick={() => handleOpen(item)}
          color="primary"
        >
          <EditIcon />
        </IconButton>
        <IconButton 
          onClick={() => handleDelete(item._id)}
          color="error"
        >
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  ))}
</TableBody>

          </Table>
        </TableContainer>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{isEditing ? 'Edit Criteria' : 'Create New Criteria'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Job Role *</InputLabel>
            <Select
              label="Job Role *"
              value={currentCriteria.jobId}
              onChange={(e) => setCurrentCriteria({ ...currentCriteria, jobId: e.target.value })}
              required
            >
              {jobs.map((job) => (
                <MenuItem key={job._id} value={job._id}>{job.role}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            margin="normal"
            label="Experience Required *"
            fullWidth
            variant="outlined"
            value={currentCriteria.experience}
            onChange={(e) => {
              const value = e.target.value;
              // Check if the input starts with a negative number
              const startsWithNegative = /^-\d/.test(value);
              if (!startsWithNegative) {
                setCurrentCriteria({ ...currentCriteria, experience: value });
              }
            }}
            placeholder="e.g., 2 years, 6 months, 1-3 years"
            required
          />
          
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Add Skills (comma-separated)"
              fullWidth
              variant="outlined"
              value={currentCriteria.skillsInput || ''}
              onChange={handleSkillsChange}
              helperText="Type a skill and press comma or space to add"
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
              {currentCriteria.skills.map(skill => (
                <Chip 
                  key={skill} 
                  label={skill} 
                  onDelete={() => removeSkill(skill)}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={!currentCriteria.jobId || !currentCriteria.experience || currentCriteria.skills.length === 0}
          >
            {isEditing ? 'Save Changes' : 'Create Criteria'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

