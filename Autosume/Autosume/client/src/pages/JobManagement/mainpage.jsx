import React from 'react';
import './JobManagement.css';

const JobManagement = () => {
  const jobs = [
    { role: 'Cleaner', date: '04/20/2025', applicants: 25 },
    { role: 'Software Engineer', date: '05/02/2023', applicants: 8 },
    { role: 'Project Manager', date: '24/07/2024', applicants: 21 },
    { role: 'Project Admin', date: '04/03/2018', applicants: 2 },
    { role: 'Part Time HelpDesk', date: '19/12/2020', applicants: 2 },
    { role: 'Freelancers', date: '01/01/2021', applicants: 2 },
    { role: 'Open', date: '', applicants: '' },
    { role: 'Open', date: '', applicants: '' },
  ];

  return (
    <div className="job-management">
      <h1>Job Management Overview</h1>
      
      <div className="layout">
        {/* Left sidebar */}
        <div className="sidebar">
          <div className="search-box">
            <input type="text" placeholder="Search..." />
          </div>
          
          <ul className="menu">
            <li className="active">Job Management</li>
            <li>Resume Shortlisting</li>
            <li>Interview Scheduling</li>
            <li>Settings</li>
            <li>Support</li>
          </ul>
        </div>
        
        {/* Main content */}
        <div className="content">
          <div className="header">
            <h2>Job Role</h2>
            <div className="user-actions">
              <span>Jason Lim</span>
              <button className="create-job">Create Job</button>
            </div>
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
            {jobs.map((job, index) => (
              <div key={index} className="table-row">
                <div>{job.role}</div>
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