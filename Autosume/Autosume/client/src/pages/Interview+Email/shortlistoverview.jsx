import React, { useState, useEffect } from 'react';
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
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ShortlistOverview() {
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/candidates')
      .then((res) => {
        setCandidates(res.data);
        setSelected(res.data[0]); // Set default selected candidate
      })
      .catch((err) => console.error('Error fetching candidates:', err));
  }, []);

  return (
    <Box p={5} bgcolor="#f5f5f5" minHeight="100vh">
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Shortlist Overview
      </Typography>

      {/* Filters (static placeholders for now) */}
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
                onClick={() => navigate('/scheduling', { state: { candidate: selected } })}
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
