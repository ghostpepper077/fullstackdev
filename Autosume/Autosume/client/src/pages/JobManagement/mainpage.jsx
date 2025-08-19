// File: src/pages/job-management/JobManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import http from '../../http';
import './mainpage.css';

// MUI
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Chip,
  Divider,
} from '@mui/material';

const JobManagement = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [applicantFilter, setApplicantFilter] = useState('');

  // confirm delete
  const [openConfirm, setOpenConfirm] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);

  // audit logs
  const [auditLogs, setAuditLogs] = useState([]);

  // fetch jobs + logs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await http.get('/jobs');
        setJobs(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch jobs');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchLogs = async () => {
      try {
        const response = await http.get('/logs');
        setAuditLogs(response.data);
      } catch (err) {
        console.error('Error fetching logs:', err);
      }
    };

    fetchJobs();
    fetchLogs();
  }, []);

  const handleCreateJob = () => {
    navigate('/jobs/create');
  };

  const confirmDeleteJob = (jobId) => {
    setJobToDelete(jobId);
    setOpenConfirm(true);
  };

  const handleDeleteJob = async () => {
    try {
      await http.delete(`/jobs/${jobToDelete}`);
      setJobs(jobs.filter(job => job._id !== jobToDelete));
      // refresh logs
      const res = await http.get('/logs');
      setAuditLogs(res.data);
      setOpenConfirm(false);
      setJobToDelete(null);
    } catch (err) {
      console.error('Error deleting job:', err);
      alert('Failed to delete job');
    }
  };

  const toggleJobStatus = async (jobId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';
    try {
      const res = await http.patch(`/jobs/${jobId}/status`, { status: newStatus });
      setJobs(jobs.map(j => j._id === jobId ? res.data : j));

      // refresh logs
      const logsRes = await http.get('/logs');
      setAuditLogs(logsRes.data);
    } catch (err) {
      console.error('Error updating job status:', err);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = (job?.role || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      !statusFilter || (job?.status || '').toLowerCase() === statusFilter.toLowerCase();

    const applicants = job.applicants || 0;
    const matchesApplicants =
      applicantFilter === ''
      || (applicantFilter === 'none' && applicants === 0)
      || (applicantFilter === '1-10' && applicants > 0 && applicants <= 10)
      || (applicantFilter === '10+' && applicants > 10);

    return matchesSearch && matchesStatus && matchesApplicants;
  });

  if (loading) return <div className="loading">Loading jobs...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="job-management">
      <h1>Job Management Overview</h1>

      {/* Search + Filters */}
      <div className="layout">
        <div className="search-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="content">
          <div className="header">
            <h2>Job Roles ({filteredJobs.length})</h2>
            <div className="user-actions">
              <div className="filters" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>

                {/* STATUS FILTER */}
                <FormControl variant="outlined" size="small" sx={{ minWidth: 140 }}>
                  <InputLabel id="status-filter-label">Status</InputLabel>
                  <Select
                    labelId="status-filter-label"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>


                {/* APPLICANT FILTER */}
                <FormControl variant="outlined" size="small" sx={{ minWidth: 160 }}>
                  <InputLabel id="applicant-filter-label">Applicants</InputLabel>
                  <Select
                    labelId="applicant-filter-label"
                    value={applicantFilter}
                    onChange={(e) => setApplicantFilter(e.target.value)}
                    label="Applicants"
                  >
                    <MenuItem value="">All Applicants</MenuItem>
                    <MenuItem value="none">0 Applicants</MenuItem>
                    <MenuItem value="1-10">1-10 Applicants</MenuItem>
                    <MenuItem value="10+">10+ Applicants</MenuItem>
                  </Select>
                </FormControl>
              </div>
              <button className="create-job" onClick={handleCreateJob}>
                CREATE JOB
              </button>
            </div>
          </div>

          {/* JOB TABLE */}
          <div className="job-table">
            <div className="table-row header">
              <div>Job Role</div>
              <div>Date Created</div>
              <div># Applicants</div>
              <div>Status</div>
              <div>Edit</div>
              <div>Delete</div>
            </div>

            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <div key={job._id} className="table-row">
                  <div>{job.role}</div>
                  <div>{new Date(job.createdAt).toLocaleDateString()}</div>
                  <div>{job.applicants || 0}</div>
                  <div>
                    <Chip
                      label={job.status.charAt(0).toUpperCase() + job.status.slice(1)} // Capitalize first letter
                      color={job.status.toLowerCase() === 'inactive' ? 'error' : 'success'}
                      size="small"
                      clickable
                      onClick={() =>
                        toggleJobStatus(
                          job._id,
                          job.status.toLowerCase() === 'active' ? 'inactive' : 'active'
                        )
                      }
                    />


                  </div>
                  <div className="action-cell">
                    <button
                      className="action-btn edit"
                      onClick={async () => {
                        await navigate(`/jobs/edit/${job._id}`);
                        // refresh audit logs after returning
                        const logsRes = await http.get('/logs');
                        setAuditLogs(logsRes.data);
                      }}
                      title="Edit"
                    >
                      &#9998;
                    </button>

                  </div>
                  <div className="action-cell">
                    <button
                      className="action-btn delete"
                      onClick={() => confirmDeleteJob(job._id)}
                      title="Delete"
                    >
                      &#128465;
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-jobs">
                {searchTerm ? 'No matching jobs found' : 'No jobs available.'}
              </div>
            )}
          </div>
        </div>
      </div>

      <Divider sx={{ margin: '2rem 0' }} />



      {/* DELETE CONFIRM */}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this job? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
          <Button onClick={handleDeleteJob} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default JobManagement;
