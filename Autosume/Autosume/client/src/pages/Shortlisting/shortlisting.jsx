import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Select, MenuItem, Button, Grid, Paper,
  Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';

// Cleaned up and expanded dummy data
const dummyCandidates = [
  {
    name: 'Audrey Hall',
    match: 92,
    skills: ['React', 'Node.js', 'TypeScript'],
    experience: '3 years',
    phone: '+65 9123 4567',
    email: 'audrey.hall@example.com',
    overview: 'A skilled software engineer with experience in developing web applications using React and Node.js.',
    experienceDetails: 'Software Engineer @ Tech Solutions Inc.\n(March 2022 - Present)\n- Developed 3 successful web apps using React, Node.js and Flask.',
    education: 'Bachelor of Science in Information Technology (2022)',
    aiSummary: 'Audrey has over three years of hands-on experience in developing dynamic and scalable web applications. Her expertise in React and Node.js makes her a strong fit for a frontend or full-stack role. She has a proven track record of delivering successful projects.'
  },
  {
    name: 'Johnathan Lee',
    match: 85,
    skills: ['Python', 'Django', 'AWS'],
    experience: '5 years',
    phone: '+65 9876 5432',
    email: 'john.lee@example.com',
    overview: 'Experienced backend developer specializing in Python and cloud infrastructure.',
    experienceDetails: 'Backend Developer @ Cloud Innovations\n(June 2020 - Present)\n- Designed and maintained scalable backend services on AWS.\n- Optimized database queries, improving API response times by 40%.',
    education: 'Bachelor of Engineering in Computer Science (2020)',
    aiSummary: 'Johnathan is a proficient backend developer with five years of experience. His skills in Python, Django, and AWS are well-suited for roles requiring robust server-side logic and cloud deployment. He demonstrates a strong ability to optimize performance.'
  },
  {
    name: 'Brenda Tan',
    match: 78,
    skills: ['Java', 'Spring Boot', 'Microservices'],
    experience: '4 years',
    phone: '+65 8765 4321',
    email: 'brenda.tan@example.com',
    overview: 'Java developer with a focus on building enterprise-level microservices.',
    experienceDetails: 'Software Engineer @ Enterprise Systems\n(July 2021 - Present)\n- Contributed to a large-scale microservices architecture using Spring Boot.\n- Wrote unit and integration tests to ensure code quality.',
    education: 'Bachelor of Computing (2021)',
    aiSummary: 'Brenda has four years of experience in Java and Spring Boot. While her match score is slightly lower, her specialization in microservices could be valuable for specific project needs. She shows a commitment to quality through rigorous testing.'
  }
];

export default function Shortlisting() {
  const navigate = useNavigate();
  const [selectedCandidate, setSelectedCandidate] = useState(dummyCandidates[0]);
  const [filters, setFilters] = useState({
    jobRole: 'Software Engineer',
    status: 'Under Review',
    experience: '>5 months',
    skills: 'Any',
  });

  return (
    <Box sx={{ flex: 1, p: 4, overflowY: 'auto', backgroundColor: '#fdfdfd' }}>
      {/* Top Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Resume Shortlisting</Typography>
        <Typography>Hariz</Typography> {/* Replace with dynamic user name if needed */}
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <Select size="small" value={filters.jobRole} onChange={(e) => setFilters({ ...filters, jobRole: e.target.value })}>
          <MenuItem value="Software Engineer">Software Engineer</MenuItem>
        </Select>
        <Select size="small" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <MenuItem value="Under Review">Under Review</MenuItem>
        </Select>
        <Select size="small" value={filters.experience} onChange={(e) => setFilters({ ...filters, experience: e.target.value })}>
          <MenuItem value=">5 months">&gt;5 months</MenuItem>
        </Select>
        <Select size="small" value={filters.skills} onChange={(e) => setFilters({ ...filters, skills: e.target.value })}>
          <MenuItem value="Any">Any</MenuItem>
        </Select>
        <Button variant="outlined" onClick={() => navigate('/create-criteria')}>+ ADD CRITERIA</Button>
      </Box>

      {/* Table + Detail View */}
      <Grid container spacing={3}>
        {/* Candidate Table */}
        <Grid item xs={12} lg={7}>
          <Paper elevation={2} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Candidate</strong></TableCell>
                  <TableCell><strong>Match %</strong></TableCell>
                  <TableCell><strong>Key Skills</strong></TableCell>
                  <TableCell><strong>Experience</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dummyCandidates.map((c) => (
                  <TableRow
                    key={c.name}
                    onClick={() => setSelectedCandidate(c)}
                    hover
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: c.name === selectedCandidate.name ? '#f5f5f5' : 'transparent'
                    }}
                  >
                    <TableCell>{c.name}</TableCell>
                    <TableCell sx={{ color: c.match >= 90 ? 'green' : 'inherit', fontWeight: 'medium' }}>{c.match}%</TableCell>
                    <TableCell>{c.skills.join(', ')}</TableCell>
                    <TableCell>{c.experience}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* Candidate Detail */}
        <Grid item xs={12} lg={5}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold">{selectedCandidate.name}</Typography>
            <Typography color="text.secondary">{selectedCandidate.phone}</Typography>
            <Typography color="text.secondary" gutterBottom>{selectedCandidate.email}</Typography>

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>Overview</Typography>
            <Typography variant="body2">{selectedCandidate.overview}</Typography>

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>Experience</Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{selectedCandidate.experienceDetails}</Typography>

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>Education</Typography>
            <Typography variant="body2">{selectedCandidate.education}</Typography>

            <Button variant="contained" sx={{ mt: 3, textTransform: 'none', fontWeight: 'bold' }}>
              View Full Resume
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* AI Summary */}
      <Paper elevation={2} sx={{ mt: 3, p: 3, backgroundColor: '#f0f4f8', borderRadius: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>AI Summary 🤖</Typography>
        <Typography variant="body2">{selectedCandidate.aiSummary}</Typography>
      </Paper>
    </Box>
  );
}