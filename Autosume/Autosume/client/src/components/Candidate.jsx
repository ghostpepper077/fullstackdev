// client/src/components/CandidateDetails.jsx
import React from 'react';

export default function CandidateDetails({ candidate }) {
  return (
    <div style={{ width: '300px', borderLeft: '1px solid #ccc', paddingLeft: '15px' }}>
      <h3>{candidate.name}</h3>
      <p>{candidate.phone}</p>
      <p>{candidate.email}</p>

      <h4>Overview</h4>
      <p>{candidate.overview}</p>

      <h4>Experience</h4>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{candidate.experienceDetails}</pre>

      <h4>Education</h4>
      <p>{candidate.education}</p>

      <button style={{ marginTop: '10px' }}>View Resume</button>
    </div>
  );
}
