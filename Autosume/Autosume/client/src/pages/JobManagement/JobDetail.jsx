import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/jobs/${id}`);
        setJob(res.data);
      } catch (err) {
        setError('Failed to load job details.');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading) return <p>Loading job details...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!job) return <p>Job not found.</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
        &larr; Back
      </button>
      <h1>{job.role}</h1>
      <p><strong>Timing / Shifts:</strong> {job.timing}</p>
      <p><strong>Salary Range:</strong> {job.salaryRange}</p>
      <p><strong>Job Type:</strong> {job.jobType}</p>
      <p><strong>Application Deadline:</strong> {job.deadline ? dayjs(job.deadline).format('YYYY-MM-DD') : 'N/A'}</p>
      <hr />
      <h3>Description</h3>
      <p style={{ whiteSpace: 'pre-line' }}>{job.description}</p>
    </div>
  );
};

export default JobDetail;
