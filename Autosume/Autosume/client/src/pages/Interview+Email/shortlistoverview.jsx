import React, { useState, useEffect } from "react";
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
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ShortlistOverview() {
  const [candidates, setCandidates] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [matchFilter, setMatchFilter] = useState(0);
  const navigate = useNavigate();

  // Fetch candidates
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/candidates/all")
      .then((res) => {
        setCandidates(res.data);
        setFiltered(res.data);
        setSelected(res.data[0]);
      })
      .catch((err) => console.error("Error fetching candidates:", err));
  }, []);

  // Filtering logic
  useEffect(() => {
    const result = candidates.filter((c) => {
      const matchStatus = statusFilter === "All" || c.status === statusFilter;
      const matchRole = roleFilter === "All" || c.role === roleFilter;
      const matchScore = c.match >= matchFilter;
      return matchStatus && matchRole && matchScore;
    });
    setFiltered(result);
    if (result.length > 0) setSelected(result[0]);
  }, [statusFilter, roleFilter, matchFilter, candidates]);

  // Unique roles for dropdown
  const uniqueRoles = ["All", ...new Set(candidates.map((c) => c.role))];

  return (
    <Box p={5} bgcolor="#f5f5f5" minHeight="100vh">
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Shortlist Overview
      </Typography>

      {/* Filters */}
      <Box display="flex" gap={2} mb={4} flexWrap="wrap">
        <Select
          size="small"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          {uniqueRoles.map((r, i) => (
            <MenuItem key={i} value={r}>
              {r}
            </MenuItem>
          ))}
        </Select>

        <Select
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {["All", "Scheduled", "Pending", "Not Sent"].map((s) => (
            <MenuItem key={s} value={s}>
              Status: {s}
            </MenuItem>
          ))}
        </Select>

        <TextField
          label="Min Match %"
          type="number"
          size="small"
          value={matchFilter}
          onChange={(e) => setMatchFilter(Number(e.target.value))}
          sx={{ width: 120 }}
        />
      </Box>

      <Grid container spacing={4}>
        {/* Candidate List */}
        <Grid item xs={12} md={4}>
  <Paper
    elevation={1}
    sx={{
      maxHeight: '75vh',
      overflowY: 'auto',
      p: 2,
      borderRadius: 2,
      border: '1px solid #ccc',
      backgroundColor: '#fafafa',
    }}
  >
    <List>
      {filtered.map((c, i) => (
        <ListItem
          key={i}
          button
          selected={selected?.name === c.name}
          onClick={() => setSelected(c)}
          sx={{
            mb: 1,
            borderRadius: 2,
            border: "1px solid #ddd",
            backgroundColor:
              selected?.name === c.name ? "#e0f7fa" : "#fff",
          }}
        >
          <ListItemText
            primary={<Typography fontWeight="bold">{c.name}</Typography>}
            secondary={
              <>
                <Typography variant="body2" color="text.secondary">
                  {c.role}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Match: {c.match}%
                </Typography>
                <Chip
                  label={c.status}
                  size="small"
                  color={
                    c.status === "Scheduled"
                      ? "success"
                      : c.status === "Pending"
                      ? "warning"
                      : "error"
                  }
                  sx={{ mt: 0.5 }}
                />
              </>
            }
          />
        </ListItem>
      ))}
    </List>
  </Paper>
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

              <Box mb={2}>
                <Typography fontWeight="bold" mb={1}>
                  Experience Details:
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  whiteSpace="pre-line"
                >
                  {selected.experienceDetails}
                </Typography>
              </Box>

              <Box>
                <Typography fontWeight="bold" mb={1}>
                  AI Summary:
                </Typography>
                <Typography
                  variant="body2"
                  whiteSpace="pre-line"
                  color="text.secondary"
                >
                  {selected.aiSummary}
                </Typography>
              </Box>

              <Button
                variant="contained"
                sx={{ mt: 3 }}
                onClick={() =>
                  navigate("/scheduling", { state: { candidate: selected } })
                }
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
