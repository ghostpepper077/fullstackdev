// client/src/components/CandidateTable.jsx
import React from 'react';

export default function CandidateTable({ candidates, setSelectedCandidate, selectedName }) {
  return (
    <table border="1" style={{ flex: 1, marginRight: '20px' }}>
      <thead>
        <tr>
          <th>Candidate</th>
          <th>Match %</th>
          <th>Key Skills</th>
          <th>Experience</th>
        </tr>
      </thead>
      <tbody>
        {candidates.map(candidate => (
          <tr
            key={candidate.name}
            onClick={() => setSelectedCandidate(candidate)}
            style={{ backgroundColor: candidate.name === selectedName ? '#e0f7fa' : 'white', cursor: 'pointer' }}
          >
            <td>{candidate.name}</td>
            <td style={{ color: candidate.match >= 90 ? 'green' : 'black' }}>{candidate.match}%</td>
            <td>{candidate.skills.join(', ')}</td>
            <td>{candidate.experience}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
