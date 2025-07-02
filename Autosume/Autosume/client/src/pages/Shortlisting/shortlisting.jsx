// client/src/pages/Shortlisting/shortlisting.jsx
import React, { useState } from 'react';
import CandidateTable from '../../components/CandidateTable';
import CandidateDetails from '../../components/CandidateDetails';
import FilterBar from '../../components/Filterbar';
import './Shortlisting.css'; // <-- IMPORT THE NEW CSS FILE
import '../../App.css';

// (Your dummyCandidates array remains the same)
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
    aiSummary: "Audrey has over three years of hands-on experience in developing dynamic and scalable web applications using React and Node.js. Her technical background aligns closely with the core requirements for the Software Engineer role, demonstrating both proficiency in modern JavaScript frameworks and practical experience in full-stack development."
  },
  { name: "Dunn Smith", match: 84, skills: ["Degree"], experience: "2 years", /*...other details*/},
  { name: "Merlin Hermes", match: 72, skills: ["BSc in IT"], experience: "7 months", /*...other details*/},
  { name: "Gerard Martin", match: 71, skills: ["MSc in CS"], experience: "6 months", /*...other details*/},
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
    <div className="main-content" style={{ flex: 1, padding: '2rem 2.5rem', backgroundColor: '#f8f9fa' }}>

      {/* Header - "Hariz" profile is now removed */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#212529' }}>Resume Shortlisting</h1>
      </div>
      
      <FilterBar filters={filters} setFilters={setFilters} />

      {/* Main content area using our new responsive CSS classes */}
      <div className="shortlisting-grid">
        <div className="table-column">
          <CandidateTable
            candidates={dummyCandidates}
            setSelectedCandidate={setSelectedCandidate}
            selectedName={selectedCandidate.name}
          />
        </div>
        <div className="details-column">
          <CandidateDetails candidate={selectedCandidate} />
        </div>
      </div>

      {/* AI Summary Card - with increased spacing and font size */}
      <div style={{ 
          marginTop: '2.5rem', 
          backgroundColor: "#ffffff", 
          padding: '2rem', 
          borderRadius: '8px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)' 
        }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', color: '#343a40' }}>AI summary</h3>
        <p style={{ margin: 0, color: '#495057', lineHeight: 1.7, fontSize: '1rem' }}>
          {selectedCandidate.aiSummary}
        </p>
      </div>
    </div>
  );
}