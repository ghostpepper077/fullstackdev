// client/src/components/FilterBar.jsx
import React from 'react';

// Styles for individual filter groups
const filterGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
};

const labelStyle = {
  fontSize: '0.9rem', // A bit bigger
  fontWeight: '500',
  marginBottom: '8px',
  color: '#495057'
};

const selectStyle = {
  padding: '10px 14px', // A bit bigger
  border: '1px solid #ced4da',
  borderRadius: '6px',
  backgroundColor: 'white',
  minWidth: '170px',
  fontSize: '1rem'
};

const buttonStyle = {
  padding: '10px 16px',
  backgroundColor: '#0d6efd',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  height: 'fit-content',
  fontWeight: '500',
  fontSize: '1rem'
};

export default function FilterBar({ filters, setFilters }) {
  return (
    // Use the className from our CSS file for responsive wrapping
    <div className="filter-bar-container"> 
      <div style={filterGroupStyle}>
        <label style={labelStyle}>Job Role</label>
        <select style={selectStyle} value={filters.jobRole} onChange={(e) => setFilters({ ...filters, jobRole: e.target.value })}>
          <option>Software Engineer</option>
          <option>Data Analyst</option>
        </select>
      </div>

      <div style={filterGroupStyle}>
        <label style={labelStyle}>Status</label>
        <select style={selectStyle} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option>Under Review</option>
          <option>Approved</option>
        </select>
      </div>
      
      <div style={filterGroupStyle}>
        <label style={labelStyle}>Experience Range</label>
        <select style={selectStyle} value={filters.experience} onChange={(e) => setFilters({ ...filters, experience: e.target.value })}>
          <option>&gt;5 months</option>
          <option>&gt;1 year</option>
          <option>&gt;3 years</option>
        </select>
      </div>
      
      <div style={filterGroupStyle}>
        <label style={labelStyle}>Skills</label>
        <select style={selectStyle} value={filters.skills} onChange={(e) => setFilters({ ...filters, skills: e.target.value })}>
          <option>Any</option>
          <option>React</option>
          <option>Node.js</option>
        </select>
      </div>

      <button style={buttonStyle}>+ Add Criteria</button>
    </div>
  );
}