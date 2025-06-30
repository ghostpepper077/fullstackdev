// client/src/pages/Shortlisting/shortlisting.jsx
import React, { useState } from 'react';
import CandidateTable from '../../components/CandidateTable';
import CandidateDetails from '../../components/Candidate';
import FilterBar from '../../components/FilterBar';
import '../../App.css';

const dummyCandidates = [
  {
    name: "Audrey Hall",
    match: 92,
    skills: ["React", "Node.js"],
    experience: "3 years",
    phone: "+6513141212",
    email: "AudreyHall@gmail.com",
    overview: "A skilled software engineer with experience in developing web applications using React and Node.js",
    experienceDetails: "Software Engineer\n3/22 - Present\nDeveloped 3 successful web apps using React, Node.js and Flask",
    education: "Bachelor of Science in Information Technology (2018)",
    aiSummary: "Audrey has over three years of hands-on experience in developing dynamic and scalable web applications using React and Node.js..."
  },
  // ... other candidates
];

export default function Shortlisting() {
  const [selectedCandidate, setSelectedCandidate] = useState(dummyCandidates[0]);
  const [filters, setFilters] = useState({
    jobRole: 'Software Engineer',
    status: 'Under Review',
    experience: '>5 months',
    skills: 'Any'
  });

  return (
    <div className="shortlisting-container" style={{ display: 'flex' }}>
      <div className="sidebar" style={{ width: '250px' }}>
        {/* Left Sidebar placeholder (you can replace with your actual Nav component) */}
      </div>
      <div className="main-content" style={{ flex: 1, padding: '20px' }}>
        <h1>Resume Shortlisting</h1>
        <FilterBar filters={filters} setFilters={setFilters} />
        <div style={{ display: 'flex', marginTop: '20px' }}>
          <CandidateTable
            candidates={dummyCandidates}
            setSelectedCandidate={setSelectedCandidate}
            selectedName={selectedCandidate.name}
          />
          <CandidateDetails candidate={selectedCandidate} />
        </div>
        <div style={{ marginTop: '20px', backgroundColor: "#f1f1f1", padding: '10px' }}>
          <h3>AI summary</h3>
          <p>{selectedCandidate.aiSummary}</p>
        </div>
      </div>
    </div>
  );
}