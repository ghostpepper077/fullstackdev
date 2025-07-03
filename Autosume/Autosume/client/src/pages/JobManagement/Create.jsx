import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './Create.css';

const Create = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Used to check if edit mode
  const isEdit = Boolean(id);

  const [jobData, setJobData] = useState({
    role: '',
    timing: '',
    salaryMin: '',
    salaryMax: '',
    jobType: 'Full Time',
    deadline: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit); // Only true in edit mode
  const [error, setError] = useState('');

  // Fetch existing job for edit
  useEffect(() => {
    if (isEdit) {
      const fetchJob = async () => {
        try {
          setFetching(true);
          const response = await axios.get(`http://localhost:5000/api/jobs/${id}`);
          const data = response.data;

          const [salaryMin, salaryMax] = (data.salaryRange || '').split('~').map(s => s.trim());

          setJobData({
            role: data.role || '',
            timing: data.timing || '',
            salaryMin: salaryMin || '',
            salaryMax: salaryMax || '',
            jobType: data.jobType || 'Full Time',
            deadline: data.deadline ? data.deadline.slice(0, 10) : '',
            description: data.description || ''
          });
          setFetching(false);
        } catch (err) {
          setFetching(false);
          setError('Failed to load job data.');
          console.error('Error fetching job:', err);
        }
      };

      fetchJob();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      ...jobData,
      salaryRange: `${jobData.salaryMin} ~ ${jobData.salaryMax}`
    };

    try {
      if (isEdit) {
        await axios.put(`http://localhost:5000/api/jobs/${id}`, payload);
      } else {
        await axios.post('http://localhost:5000/api/jobs', {
          ...payload,
          applicants: 0,
          createdAt: new Date().toISOString()
        });
      }

      setLoading(false);
      navigate('/job-management');
    } catch (err) {
      setLoading(false);
      setError(`Failed to ${isEdit ? 'update' : 'create'} job. Please try again.`);
      console.error(`Error ${isEdit ? 'updating' : 'creating'} job:`, err);
    }
  };

  return (
    <div className="create-container">
      <div className="create-header">
        <button onClick={() => navigate(-1)} className="back-button">
          &larr; Back
        </button>
        <h1>{isEdit ? 'Edit Job' : 'Create New Job'}</h1>
      </div>

      {fetching ? (
        <p>Loading job data...</p>
      ) : (
        <form onSubmit={handleSubmit} className="job-form">
          <div className="form-group">
            <label>Job name/role</label>
            <input
              type="text"
              name="role"
              placeholder="e.g. Software Engineer"
              value={jobData.role}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Timing/shifts</label>
            <input
              type="text"
              name="timing"
              placeholder="e.g. 5 Times a week"
              value={jobData.timing}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Salary Range</label>
              <div className="salary-inputs">
                <input
                  type="number"
                  name="salaryMin"
                  placeholder="Min"
                  value={jobData.salaryMin}
                  onChange={handleChange}
                  required
                />
                <span>to</span>
                <input
                  type="number"
                  name="salaryMax"
                  placeholder="Max"
                  value={jobData.salaryMax}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Job type</label>
              <select
                name="jobType"
                value={jobData.jobType}
                onChange={handleChange}
              >
                <option>Full Time</option>
                <option>Part Time</option>
                <option>Contract</option>
                <option>Internship</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Application Deadline</label>
            <input
              type="date"
              name="deadline"
              value={jobData.deadline}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Job description</label>
            <textarea
              name="description"
              placeholder="Type job details here..."
              value={jobData.description}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? (isEdit ? 'Updating...' : 'Creating...') : isEdit ? 'Update Job' : 'Create Job'}
          </button>

          {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
        </form>
      )}
    </div>
  );
};

export default Create;
