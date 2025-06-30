import React from 'react';
import { useNavigate } from 'react-router-dom';
import './mainpage.css';

const JobManagement = () => {
  const navigate = useNavigate();

  const jobRoles = [
    { title: 'Cleaner', date: '04/20/2025', applicants: 25 },
    { title: 'Software Engineer', date: '05/02/2023', applicants: 8 },
    { title: 'Project Manager', date: '24/07/2024', applicants: 21 },
    { title: 'Project Admin', date: '04/03/2018', applicants: 2 },
    { title: 'Part Time HelpDesk', date: '19/12/2020', applicants: 2 },
    { title: 'Freelancers', date: '01/01/2021', applicants: 2 },
    { title: 'Open', date: '', applicants: '' },
    { title: 'Open', date: '', applicants: '' },
  ];

  return (
    <div className="job-management-container">
      <h1>Job Management Overview</h1>
      
      <div className="layout">
        {/* Left sidebar */}
        <div className="sidebar">
          <div className="search-box">
            <input type="text" placeholder="Search..." />
          </div>
          
          <ul className="menu">
            <li className="active">Job Management</li>
            <li onClick={() => navigate('/shortlisting')}>Resume Shortlisting</li>
            <li>Interview Scheduling</li>
            <li>Settings</li>
            <li>Support</li>
          </ul>
          
          <div className="user-section">
            <span>Jason Lim</span>
            <button className="create-job-btn">Create Job</button>
          </div>
        </div>
        
        {/* Main content */}
        <div className="content">
          <div className="header">
            <h2>Job Role</h2>
          </div>
          
          <div className="job-table">
            {/* Table header */}
            <div className="table-row header">
              <div>Job Role</div>
              <div>Date</div>
              <div># Applicants</div>
              <div>Action</div>
            </div>
            
            {/* Table rows */}
            {jobRoles.map((job, index) => (
              <div key={index} className="table-row">
                <div>{job.title}</div>
                <div>{job.date}</div>
                <div>{job.applicants}</div>
                <div>
                  <button className="action-btn">...</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobManagement;