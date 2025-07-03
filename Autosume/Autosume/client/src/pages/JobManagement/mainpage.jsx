import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import http from '../../http'; // Import your HTTP client
import './mainpage.css';

const JobManagement = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await http.get('/jobs'); // Adjust endpoint as needed
        setJobs(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch jobs');
        setLoading(false);
        console.error('Error fetching jobs:', err);
      }
    };

    fetchJobs();
  }, []);

  const handleCreateJob = () => {
    navigate('/jobs/create');
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await http.delete(`/jobs/${jobId}`);
      setJobs(jobs.filter(job => job._id !== jobId));
    } catch (err) {
      console.error('Error deleting job:', err);
      alert('Failed to delete job');
    }
  };

  const filteredJobs = jobs.filter(job =>
    (job?.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  );


  if (loading) {
    return <div className="loading">Loading jobs...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="job-management">
      <h1>Job Management Overview</h1>

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
              <button className="create-job" onClick={handleCreateJob}>
                Create Job
              </button>
            </div>
          </div>

          <div className="job-table">
            <div className="table-row header">
              <div>Job Role</div>
              <div>Date Created</div>
              <div># Applicants</div>
              <div>Status</div>
              <div>Actions</div>
            </div>

            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <div key={job._id} className="table-row">
                  <div>{job.role}</div>
                  <div>{new Date(job.createdAt).toLocaleDateString()}</div>
                  <div>{job.applicants || 0}</div>
                  <div>{job.status || 'Active'}</div>
                  <div className="action-buttons">
                    <button
                      className="action-btn view"
                      onClick={() => navigate(`/jobs/edit/${job._id}`)}
                    >
                      View
                    </button>

                    <button
                      className="action-btn delete"
                      onClick={() => handleDeleteJob(job._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-jobs">
                {searchTerm ? 'No matching jobs found' : 'No jobs available. Create your first job!'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobManagement;