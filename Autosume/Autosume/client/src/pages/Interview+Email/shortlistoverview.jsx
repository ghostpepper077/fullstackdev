import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';

const candidates = [
  {
    name: 'Audrey Hall',
    role: 'Solution Architect',
    match: 92,
    status: 'Scheduled',
    email: 'audrey.hall@email.com',
    phone: '+65 9012 1234',
    skills: ['React', 'Node.js', 'Architecture'],
    experience: '3+ years',
    summary:
      'Audrey has solid experience in building scalable architecture solutions using modern tech stacks like React and Node.js.',
  },
  {
    name: 'Samanta Wong',
    role: 'UI/UX Designer',
    match: 87,
    status: 'Pending',
    email: 'wongsamanta_23@gmail.com',
    phone: '+65 8012 3040',
    skills: ['Figma', 'UI/UX', 'Prototyping', 'Thinking', 'Design'],
    experience: '3+ years',
    summary:
      'Samanta Wong brings over three years of experience in crafting intuitive and visually engaging user interfaces...',
  },
  {
    name: 'Jason Lim',
    role: 'Data Scientist',
    match: 86,
    status: 'Not Scheduled',
    email: 'jason.lim@email.com',
    phone: '+65 8123 9988',
    skills: ['Python', 'Pandas', 'Machine Learning'],
    experience: '1.5 years',
    summary:
      'Jason is a data-driven individual with experience in building machine learning models and working with big datasets in Python.',
  },
];

export default function ShortlistOverview() {
  const [selected, setSelected] = useState(candidates[0]);

  return (
    <Box p={5} bgcolor="#f5f5f5" minHeight="100vh">
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Shortlist Overview
      </Typography>

      {/* Filters */}
      <Box display="flex" gap={2} mb={4}>
        <Select size="small" defaultValue="Software Engineer">
          <MenuItem value="Software Engineer">Software Engineer</MenuItem>
        </Select>
        <Select size="small" defaultValue="Any">
          <MenuItem value="Any">Status: Any</MenuItem>
        </Select>
        <Select size="small" defaultValue=">70%">
          <MenuItem value=">70%">Match: &gt;70%</MenuItem>
        </Select>
      </Box>

      <Grid container spacing={4}>
        {/* Candidate List */}
        <Grid item xs={12} md={4}>
          <List>
            {candidates.map((c, i) => (
              <ListItem
                key={i}
                button
                selected={selected?.name === c.name}
                onClick={() => setSelected(c)}
                sx={{ mb: 1, borderRadius: 1, border: '1px solid #ddd' }}
              >
                <ListItemText
                  primary={c.name}
                  secondary={
                    <>
                      <Typography variant="body2">{c.role}</Typography>
                      <Typography variant="caption">{c.match}% Match</Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          mt: 0.5,
                          color:
                            c.status === 'Scheduled'
                              ? 'green'
                              : c.status === 'Pending'
                              ? 'orange'
                              : 'red',
                        }}
                      >
                        {c.status}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Grid>

        {/* Candidate Details */}
        <Grid item xs={12} md={8}>
          {selected && (
            <Paper elevation={3} sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight="bold">
                {selected.name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {selected.role}
              </Typography>
              <Typography variant="body2">{selected.email}</Typography>
              <Typography variant="body2" gutterBottom>
                {selected.phone}
              </Typography>

              <Box my={2}>
                <Typography fontWeight="bold" mb={1}>
                  Skills:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {selected.skills.map((skill, i) => (
                    <Chip key={i} label={skill} />
                  ))}
                </Box>
              </Box>

              <Typography mb={2}>
                <strong>Experience:</strong> {selected.experience}
              </Typography>

              <Box>
                <Typography fontWeight="bold" mb={1}>
                  AI Summary:
                </Typography>
                <Typography variant="body2" whiteSpace="pre-line" color="text.secondary">
                  {selected.summary}
                </Typography>
              </Box>

              <Button
                variant="contained"
                sx={{ mt: 3 }}
                onClick={() => alert(`Proceeding to schedule for ${selected.name}`)}
              >
                Proceed to Schedule
              </Button>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
