import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, 
  Alert, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import http from '../../http';

export default function CreateCriteria() {
  const [criteriaList, setCriteriaList] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCriteria, setCurrentCriteria] = useState({ id: null, jobId: '', experience: '', skills: '' });

  // Fetch all existing criteria
  const fetchCriteria = async () => {
    try {
      const response = await http.get('/criteria');
      setCriteriaList(response.data);
    } catch (err) {
      setError('Failed to fetch criteria.');
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
      setError('Failed to fetch job roles for the form.');
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
        jobId: criteria.jobId._id, // Use the job ID
        experience: criteria.experience, 
        skills: criteria.skills.join(', ') // Convert array back to string for editing
      });
    } else {
      setIsEditing(false);
      setCurrentCriteria({ id: null, jobId: '', experience: '', skills: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // CRUD operation handlers
  const handleSave = async () => {
    const { id, ...data } = currentCriteria;
    try {
      if (isEditing) {
        await http.put(`/criteria/${id}`, data);
      } else {
        await http.post('/criteria', data);
      }
      fetchCriteria(); // Refresh the list
      handleClose();
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this criteria?')) {
      try {
        await http.delete(`/criteria/${id}`);
        fetchCriteria(); // Refresh the list
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Manage Job Criteria</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>Add New Criteria</Button>
      </Box>

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
              <TableRow key={item._id}>
                <TableCell>{item.jobId?.role || 'N/A'}</TableCell>
                <TableCell>{item.experience}</TableCell>
                <TableCell>{item.skills.join(', ')}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpen(item)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(item._id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{isEditing ? 'Edit Criteria' : 'Create New Criteria'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Job Role</InputLabel>
            <Select
              label="Job Role"
              value={currentCriteria.jobId}
              onChange={(e) => setCurrentCriteria({ ...currentCriteria, jobId: e.target.value })}
            >
              {jobs.map((job) => (
                <MenuItem key={job._id} value={job._id}>{job.role}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Experience Required"
            fullWidth
            variant="outlined"
            value={currentCriteria.experience}
            onChange={(e) => setCurrentCriteria({ ...currentCriteria, experience: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Required Skills (comma-separated)"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={currentCriteria.skills}
            onChange={(e) => setCurrentCriteria({ ...currentCriteria, skills: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">{isEditing ? 'Save Changes' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}