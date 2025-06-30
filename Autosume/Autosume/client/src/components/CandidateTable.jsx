// client/src/components/CandidateTable.jsx
import React from 'react';

const getMatchStyle = (match) => {
  let backgroundColor = '#f1f1f1'; // Default grey
  let color = '#333';
  if (match >= 90) {
    backgroundColor = '#28a745'; // Strong green
    color = 'white';
  } else if (match >= 80) {
    backgroundColor = '#d4edda'; // Light green
    color = '#155724';
  } else if (match >= 70) {
    backgroundColor = '#fff3cd'; // Yellow
    color = '#856404';
  }
  return {
    backgroundColor,
    color,
    fontWeight: 'bold',
    borderRadius: '4px',
    padding: '5px 10px',
    textAlign: 'center',
    display: 'inline-block', // To make the border-radius wrap the content
    minWidth: '50px'
  };
};

export default function CandidateTable({ candidates, setSelectedCandidate, selectedName }) {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #dee2e6' }}>
            <th style={{ padding: '12px', textAlign: 'left', color: '#6c757d' }}>Candidate</th>
            <th style={{ padding: '12px', textAlign: 'left', color: '#6c757d' }}>Match %</th>
            <th style={{ padding: '12px', textAlign: 'left', color: '#6c757d' }}>Key Skills</th>
            <th style={{ padding: '12px', textAlign: 'left', color: '#6c757d' }}>Experience</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map(candidate => (
            <tr
              key={candidate.name}
              onClick={() => setSelectedCandidate(candidate)}
              style={{ 
                borderBottom: '1px solid #f1f1f1', 
                cursor: 'pointer',
                backgroundColor: candidate.name === selectedName ? '#e8f4fd' : 'white'
              }}
              onMouseEnter={(e) => { if(candidate.name !== selectedName) e.currentTarget.style.backgroundColor = '#f8f9fa'; }}
              onMouseLeave={(e) => { if(candidate.name !== selectedName) e.currentTarget.style.backgroundColor = 'white'; }}
            >
              <td style={{ padding: '12px', fontWeight: '500' }}>{candidate.name}</td>
              <td style={{ padding: '12px' }}>
                <span style={getMatchStyle(candidate.match)}>{candidate.match}%</span>
              </td>
              <td style={{ padding: '12px' }}>{candidate.skills.join(', ')}</td>
              <td style={{ padding: '12px' }}>{candidate.experience}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}