// client/src/components/CandidateDetails.jsx
import React from 'react';

export default function CandidateDetails({ candidate }) {
  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    height: '100%' // Ensure it fills the container height
  };

  const buttonStyle = {
    width: '100%',
    padding: '10px',
    backgroundColor: '#0d6efd',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '20px',
    fontWeight: '500'
  };

  return (
    <div style={cardStyle}>
      <h3 style={{ marginTop: 0, marginBottom: '5px', fontSize: '1.25rem' }}>{candidate.name}</h3>
      <p style={{ margin: '0 0 1rem 0', color: '#6c757d', fontSize: '0.9rem' }}>
        {candidate.phone}<br/>{candidate.email}
      </p>

      <h4 style={{ borderTop: '1px solid #f1f1f1', paddingTop: '1rem', color: '#333' }}>Overview</h4>
      <p style={{ color: '#555', fontSize: '0.9rem' }}>{candidate.overview}</p>

      <h4 style={{ color: '#333' }}>Experience</h4>
      <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.9rem', color: '#555', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '5px' }}>
        {candidate.experienceDetails}
      </pre>

      <h4 style={{ color: '#333' }}>Education</h4>
      <p style={{ color: '#555', fontSize: '0.9rem' }}>{candidate.education}</p>

      <button style={buttonStyle}>View Resume</button>
    </div>
  );
}