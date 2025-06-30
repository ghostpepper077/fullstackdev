// client/src/components/FilterBar.jsx
import React from 'react';

export default function FilterBar({ filters, setFilters }) {
  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <select value={filters.jobRole} onChange={(e) => setFilters({ ...filters, jobRole: e.target.value })}>
        <option>Software Engineer</option>
        <option>Data Analyst</option>
      </select>

      <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
        <option>Under Review</option>
        <option>Approved</option>
      </select>

      <select value={filters.experience} onChange={(e) => setFilters({ ...filters, experience: e.target.value })}>
        <option>5 months</option>
        <option>1 year</option>
      </select>

      <select value={filters.skills} onChange={(e) => setFilters({ ...filters, skills: e.target.value })}>
        <option>Any</option>
        <option>React</option>
        <option>Node.js</option>
      </select>

      <button>+ Add Criteria</button>
    </div>
  );
}
