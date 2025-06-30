import React, { useState } from 'react';
import {
  Box, Typography, Select, MenuItem, Button, Grid, Paper,
  Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';

const dummyCandidates = [
  {
    name: 'Audrey Hall',
    match: 92,
    skills: ['React', 'Node.js'],
    experience: '3 years',
    phone: '+6513141212',
    email: 'AudreyHall@gmail.com',
    overview: 'A skilled software engineer with experience in developing web applications using React and Node.js',
    experienceDetails: 'Software Engineer\n3/22 - Present\nDeveloped 3 successful web applications using React, Node.js and Flask',
    education: 'Bachelor of Science in Information Technology (2018)',
    aiSummary: 'Audrey has over three years of hands-on experience in developing dynamic and scalable web applications using React and Node.js...',
  },
  // Add more candidates as needed
];

export default function Shortlisting() {
  const [selectedCandidate, setSelectedCandidate] = useState(dummyCandidates[0]);
  const [filters, setFilters] = useState({
    jobRole: 'Software Engineer',
    status: 'Under Review',
    experience: '>5 months',
    skills: 'Any',
  });

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      {/* Sidebar */}
      <Box sx={{
        width: 240,
        backgroundColor: '#1e1e1e',
        color: 'white',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>AUTOSUME</Typography>
          <Button fullWidth sx={{ color: 'white', justifyContent: 'flex-start' }}>DASHBOARD</Button>
          <Button fullWidth sx={{ color: 'white', justifyContent: 'flex-start' }}>JOB MANAGEMENT</Button>
          <Button fullWidth sx={{ backgroundColor: '#ffffff40', color: 'white', justifyContent: 'flex-start', mt: 1, mb: 1 }}>
            RESUME SHORTLISTING
          </Button>
          <Button fullWidth sx={{ color: 'white', justifyContent: 'flex-start' }}>INTERVIEW SCHEDULING</Button>
          <Button fullWidth sx={{ color: 'white', justifyContent: 'flex-start' }}>SETTINGS</Button>
        </Box>
        <Button variant="outlined" sx={{ color: 'white', borderColor: 'white' }}>LOG OUT</Button>
      </Box>

      {/* Main content */}
      <Box sx={{ flex: 1, p: 4, overflowY: 'auto', backgroundColor: '#fdfdfd' }}>
        {/* Top Bar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">Resume Shortlisting</Typography>
          <Typography sx={{ mt: 1 }}>Hariz</Typography>
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Select value={filters.jobRole} onChange={(e) => setFilters({ ...filters, jobRole: e.target.value })}>
            <MenuItem value="Software Engineer">Software Engineer</MenuItem>
          </Select>
          <Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <MenuItem value="Under Review">Under Review</MenuItem>
          </Select>
          <Select value={filters.experience} onChange={(e) => setFilters({ ...filters, experience: e.target.value })}>
            <MenuItem value=">5 months">&gt;5 months</MenuItem>
          </Select>
          <Select value={filters.skills} onChange={(e) => setFilters({ ...filters, skills: e.target.value })}>
            <MenuItem value="Any">Any</MenuItem>
          </Select>
          <Button variant="outlined">+ ADD CRITERIA</Button>
        </Box>

        {/* Table + Detail View */}
        <Grid container spacing={2}>
          {/* Candidate Table */}
          <Grid item xs={7}>
            <Paper elevation={1}>
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
                      sx={{ cursor: 'pointer', backgroundColor: c.name === selectedCandidate.name ? '#f5f5f5' : 'transparent' }}
                    >
                      <TableCell>{c.name}</TableCell>
                      <TableCell sx={{ color: c.match >= 90 ? 'green' : 'black' }}>{c.match}%</TableCell>
                      <TableCell>{c.skills.join(', ')}</TableCell>
                      <TableCell>{c.experience}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>

          {/* Candidate Detail */}
          <Grid item xs={5}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="h6">{selectedCandidate.name}</Typography>
              <Typography>{selectedCandidate.phone}</Typography>
              <Typography>{selectedCandidate.email}</Typography>

              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>Overview</Typography>
              <Typography>{selectedCandidate.overview}</Typography>

              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>Experience</Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>{selectedCandidate.experienceDetails}</Typography>

              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>Education</Typography>
              <Typography>{selectedCandidate.education}</Typography>

              <Button variant="contained" sx={{ mt: 2, textTransform: 'none', fontWeight: 'bold' }}>
                View Resume
              </Button>
            </Paper>
          </Grid>
        </Grid>

        {/* AI Summary */}
        <Paper elevation={1} sx={{ mt: 4, p: 2, backgroundColor: '#f0f0f0' }}>
          <Typography variant="subtitle1" fontWeight="bold">AI summary</Typography>
          <Typography>{selectedCandidate.aiSummary}</Typography>
        </Paper>
      </Box>
    </Box>
  );
}
