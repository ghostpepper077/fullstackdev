// client/src/pages/Shortlisting/shortlisting.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CandidateTable from '../../components/CandidateTable';
import CandidateDetails from '../../components/Candidate';
import FilterBar from '../../components/FilterBar';
import '../../App.css';

const Shortlisting = () => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [criteriaList, setCriteriaList] = useState([]);
  const [selectedCriteria, setSelectedCriteria] = useState('');
  const navigate = useNavigate();

  const dummyCandidates = [
    {
      name: "Audrey Hall",
      match: 92,
      skills: ["React", "Node.js"],
      experience: "3 years",
      phone: "+65 8123 4567",
      email: "audrey@example.com",
      summary: "Full-stack developer with strong frontend expertise.",
    },
    {
      name: "Bryan Lim",
      match: 85,
      skills: ["Python", "Flask"],
      experience: "2 years",
      phone: "+65 8123 9876",
      email: "bryan@example.com",
      summary: "Backend developer focused on APIs and system integration.",
    },
  ];

  useEffect(() => {
    // Fetch criteria from backend
    fetch('http://localhost:5000/api/criteria')
      .then((res) => res.json())
      .then((data) => setCriteriaList(data))
      .catch((err) => console.error('Error loading criteria:', err));
  }, []);

  const handleCandidateSelect = (candidate) => {
    setSelectedCandidate(candidate);
  };

  return (
    <div className="shortlisting-container">
      <h2>Shortlisting Candidates</h2>

      {/* Add Criteria Button */}
      <button onClick={() => navigate('/create-criteria')} className="btn btn-primary mb-3">
        + Add Criteria
      </button>

      {/* Criteria Filter Dropdown */}
      <div className="mb-3">
        <label htmlFor="criteriaDropdown">Filter by Criteria:</label>
        <select
          id="criteriaDropdown"
          className="form-select"
          value={selectedCriteria}
          onChange={(e) => setSelectedCriteria(e.target.value)}
        >
          <option value="">-- Select --</option>
          {criteriaList.map((c, idx) => (
            <option key={idx} value={c.label}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Candidate Table */}
      <CandidateTable
        candidates={dummyCandidates}
        onCandidateSelect={handleCandidateSelect}
      />

      {/* Candidate Details */}
      {selectedCandidate && (
        <CandidateDetails candidate={selectedCandidate} />
      )}
    </div>
  );
};

export default Shortlisting;
