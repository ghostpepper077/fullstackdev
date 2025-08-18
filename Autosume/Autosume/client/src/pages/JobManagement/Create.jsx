import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './Create.css';

// MUI DatePicker imports
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import TextField from '@mui/material/TextField';
import dayjs from 'dayjs';

const Create = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [jobData, setJobData] = useState({
    role: '',
    description: '',
    deadline: null,
    salaryMin: '',
    salaryMax: '',
    timing: '',
    jobType: 'Full Time',
    department: '', // ✅ department added
  });

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

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
            department: data.department || '', // ✅ pre-fill department
            deadline: data.deadline ? dayjs(data.deadline) : null,
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

  const handleDateChange = (newValue) => {
    setJobData(prev => ({ ...prev, deadline: newValue }));
  };

  const validate = () => {
    if (!jobData.role.trim()) return 'Job title is required.';
    if (!jobData.timing.trim()) return 'Timing/shifts is required.';
    if (!jobData.description.trim()) return 'Job description is required.';
    if (!jobData.department.trim()) return 'Department is required.';
    if (jobData.salaryMin === '' || jobData.salaryMin === null) return 'Minimum salary is required.';
    if (isNaN(jobData.salaryMin) || Number(jobData.salaryMin) < 0) return 'Minimum salary must be a number ≥ 0.';
    if (jobData.salaryMax === '' || jobData.salaryMax === null) return 'Maximum salary is required.';
    if (isNaN(jobData.salaryMax) || Number(jobData.salaryMax) < 0) return 'Maximum salary must be a number ≥ 0.';
    if (Number(jobData.salaryMin) > Number(jobData.salaryMax)) return 'Minimum salary cannot be greater than maximum salary.';
    if (!jobData.deadline) return 'Please select an application deadline.';
    if (dayjs(jobData.deadline).isBefore(dayjs(), 'day')) return 'Application deadline cannot be in the past.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setError('');

    const validationMsg = validate();
    if (validationMsg) {
      setValidationError(validationMsg);
      return;
    }

    setLoading(true);

    const payload = {
      ...jobData,
      salaryRange: `${jobData.salaryMin} ~ ${jobData.salaryMax}`,
      deadline: jobData.deadline ? jobData.deadline.toISOString() : null,
    };

    try {
      if (isEdit) {
        await axios.put(`http://localhost:5000/api/jobs/${id}`, payload);
      } else {
        console.log("Payload being sent:", payload);

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

  const generateDescription = async () => {
    setAiLoading(true);
    setError('');
    setValidationError('');

    try {
      const res = await axios.post('http://localhost:5000/api/ai/generate-description', {
        pointers: jobData.description,
        role: jobData.role
      });

      const data = res.data;

      setJobData(prev => ({
        ...prev,
        description: data.description || prev.description,
        timing: data.timing || prev.timing,
        salaryMin: data.salaryMin || prev.salaryMin,
        salaryMax: data.salaryMax || prev.salaryMax,
        jobType: data.jobType || prev.jobType,
        deadline: data.deadline ? dayjs(data.deadline) : prev.deadline,
      }));
    } catch (err) {
      console.error(err);
      setError('Failed to enhance job with AI.');
    } finally {
      setAiLoading(false);
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
        <form onSubmit={handleSubmit} className="job-form" noValidate>
          <div className="form-group">
            <label>Job Pointers / Description</label>
            <small className="helper-text">
              Write a few pointers here and let AI generate the full job post.
            </small>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <textarea
                name="description"
                placeholder="Type job details here or use AI..."
                value={jobData.description}
                onChange={handleChange}
                rows={5}
                style={{ flex: 1 }}
                required
              />
              <button
                type="button"
                onClick={generateDescription}
                className="enhance-ai-button"
                disabled={aiLoading}
              >
                {aiLoading ? 'Generating...' : '✨ Auto-fill Job with AI'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Job Title</label>
            <input
              type="text"
              name="role"
              placeholder="Fullstack Developer, Data Scientist, etc."
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

          <div className="form-group">
            <label>Department</label>
            <select
              name="department"
              value={jobData.department}
              onChange={handleChange}
              required
            >
              <option value="">Select Department</option>
              <option value="IT">IT</option>
              <option value="Sales">Sales</option>
              <option value="Logistics">Logistics</option>
              <option value="Marketing">Marketing</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Customer Support">Customer Support</option>
            </select>
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
                  min="0"
                />
                <span>to</span>
                <input
                  type="number"
                  name="salaryMax"
                  placeholder="Max"
                  value={jobData.salaryMax}
                  onChange={handleChange}
                  required
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Job type</label>
              <select
                className="form-control"
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
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={jobData.deadline}
                onChange={handleDateChange}
                disablePast
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </LocalizationProvider>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? (isEdit ? 'Updating...' : 'Creating...') : isEdit ? 'Update Job' : 'Create Job'}
          </button>

          {(validationError || error) && (
            <div className="validation-error-block" style={{ marginTop: '1rem' }}>
              <p style={{ color: 'red', fontWeight: '600' }}>{validationError || error}</p>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default Create;
