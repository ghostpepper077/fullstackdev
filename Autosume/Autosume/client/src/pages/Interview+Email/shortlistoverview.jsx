// shortlistoverview.jsx
// (imports unchanged)
import React, { useState, useEffect } from "react";
import {
  Box, Grid, Typography, Paper, Button, Select, MenuItem, Chip,
  TextField, Tooltip, Slider, CircularProgress,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import WorkIcon from "@mui/icons-material/Work";
import NotesIcon from "@mui/icons-material/Notes";
import PsychologyIcon from "@mui/icons-material/Psychology";
import FilterListIcon from "@mui/icons-material/FilterList";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import BlockIcon from "@mui/icons-material/Block";
import { useNavigate } from "react-router-dom";
import http from "../../http";
import DashboardIcon from "@mui/icons-material/Dashboard";

const statusIcon = {
  Scheduled: <EventAvailableIcon fontSize="inherit" />,
  Pending: <HourglassEmptyIcon fontSize="inherit" />,
  Unscheduled: <BlockIcon fontSize="inherit" />,
  Screened: <HourglassEmptyIcon fontSize="inherit" />,
};

function CandidateCard({ candidate, selected, onSelect }) {
  return (
    <Box
      onClick={() => onSelect(candidate)}
      sx={{
        mb: 1,
        borderRadius: 2,
        border: "1px solid #ddd",
        backgroundColor: selected?.email === candidate.email ? "#e0f7fa" : "#fff",
        p: 2,
        cursor: "pointer",
      }}
    >
      <Typography fontWeight="bold">{candidate.name || "Unknown"}</Typography>
      <Typography variant="body2" color="text.secondary">
        {candidate.role || "—"}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Match: {candidate.match ?? 0}%
      </Typography>
      <Tooltip
        title={
          candidate.status === "Scheduled"
            ? "Interview booked"
            : candidate.status === "Pending"
            ? "Awaiting action"
            : candidate.status === "Screened"
            ? "Screened and ready"
            : "Not yet processed"
        }
      >
        <Chip
          icon={statusIcon[candidate.status] || null}
          label={candidate.status || "Screened"}
          size="small"
          color={
            candidate.status === "Scheduled"
              ? "success"
              : candidate.status === "Pending" || candidate.status === "Screened"
              ? "warning"
              : "error"
          }
          sx={{ mt: 0.5 }}
        />
      </Tooltip>
    </Box>
  );
}

const normalize = (c) => ({
  _id: c._id,
  email: c.email || "",
  phone: c.phone || "",
  name: c.name || "Unknown",
  role: c.role || c.jobRole || "—",
  match: typeof c.match === "number" ? c.match : c.matchPercentage ?? 0,
  skills: Array.isArray(c.skills) ? c.skills : Array.isArray(c.matchedSkills) ? c.matchedSkills : [],
  experienceDetails: c.experienceDetails || c.experience || "",
  aiSummary: c.aiSummary || c.summary || "",
  status: c.status || "Screened",
});

export default function ShortlistOverview() {
  const [candidates, setCandidates] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [matchFilter, setMatchFilter] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    http.get("/screened-candidates")
      .then((res) => {
        const rows = Array.isArray(res.data) ? res.data.map(normalize) : [];
        setCandidates(rows);
        setFiltered(rows);
        setSelected(rows[0] || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching screened candidates:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const s = search.toLowerCase().trim();
    const result = candidates.filter((c) => {
      const matchStatus = statusFilter === "All" || (c.status || "Screened") === statusFilter;
      const matchRole = roleFilter === "All" || (c.role || "—") === roleFilter;
      const matchScore = (c.match ?? 0) >= matchFilter;
      const matchName =
        c.name?.toLowerCase().includes(s) ||
        c.email?.toLowerCase().includes(s) ||
        c.skills?.some((sk) => sk.toLowerCase().includes(s));

      return matchStatus && matchRole && matchScore && (s ? matchName : true);
    });
    setFiltered(result);
    if (result.length > 0) setSelected(result[0]);
  }, [statusFilter, roleFilter, matchFilter, search, candidates]);

  const uniqueRoles = ["All", ...new Set(candidates.map((c) => c.role || "—"))]; // ✅ fixed

  return (
    <Box p={5} bgcolor="#f5f5f5" minHeight="100vh">
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
  <Typography variant="h4" fontWeight={600}>
    Shortlist Overview
  </Typography>

  <Button
    variant="outlined"
    startIcon={<DashboardIcon />}
    onClick={() => navigate("/interviewdashboard")}
  >
    Go to Interview Dashboard
  </Button>
</Box>


      <Typography variant="subtitle2" display="flex" alignItems="center" gap={1} mb={1}>
        <FilterListIcon fontSize="small" /> Filters
      </Typography>

      {/* Filters */}
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <TextField
          size="small"
          label="Search Name / Email / Skill"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select size="small" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          {uniqueRoles.map((r, i) => (
            <MenuItem key={i} value={r}>{r}</MenuItem>
          ))}
        </Select>

        <Select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {["All", "Screened", "Scheduled", "Pending", "Unscheduled"].map((s) => (
            <MenuItem key={s} value={s}>Status: {s}</MenuItem>
          ))}
        </Select>

        <Box width={200}>
          <Typography variant="caption">Min Match %</Typography>
          <Slider
            value={matchFilter}
            onChange={(e, val) => setMatchFilter(val)}
            valueLabelDisplay="auto"
            step={5}
            min={0}
            max={100}
          />
        </Box>
      </Box>

      <Typography variant="body2" color="text.secondary" mb={2}>
        {filtered.length} matching candidate{filtered.length !== 1 && "s"} found
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={4}>
          {/* Candidate List */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={1}
              sx={{
                maxHeight: "75vh",
                overflowY: "auto",
                p: 2,
                borderRadius: 2,
                border: "1px solid #ccc",
                backgroundColor: "#fafafa",
              }}
            >
              {filtered.length === 0 ? (
                <Typography>No candidates match your filters.</Typography>
              ) : (
                filtered.map((c) => (
                  <CandidateCard
                    key={c._id || c.email}
                    candidate={c}
                    selected={selected}
                    onSelect={setSelected}
                  />
                ))
              )}
            </Paper>
          </Grid>

          {/* Candidate Details */}
          <Grid item xs={12} md={8}>
            {selected ? (
              <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
                <Box sx={{ background: "linear-gradient(to right, #1976d2, #42a5f5)", p: 1.5, px: 3 }}>
                  <Typography color="white" variant="h6">👤 Candidate Details</Typography>
                </Box>
                <Box p={4}>
                  <Typography variant="h5" fontWeight="bold">{selected.name}</Typography>
                  <Typography variant="subtitle1" color="text.secondary">{selected.role}</Typography>
                  <Typography variant="body2">
                    <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                    {selected.email || "—"}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                    {selected.phone || "—"}
                  </Typography>

                  <Box my={2}>
                    <Typography fontWeight="bold" mb={1}>
                      <WorkIcon fontSize="small" sx={{ mr: 1 }} /> Skills:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {(selected.skills || []).map((skill, i) => (
                        <Chip key={i} label={skill} />
                      ))}
                    </Box>
                  </Box>

                  <Box mb={2}>
                    <Typography fontWeight="bold" mb={1}>
                      <NotesIcon fontSize="small" sx={{ mr: 1 }} /> Experience Details:
                    </Typography>
                    <Typography variant="body2" color="text.secondary" whiteSpace="pre-line">
                      {selected.experienceDetails || "—"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography fontWeight="bold" mb={1}>
                      <PsychologyIcon fontSize="small" sx={{ mr: 1 }} /> AI Summary:
                    </Typography>
                    <Typography variant="body2" whiteSpace="pre-line" color="text.secondary">
                      {selected.aiSummary || "—"}
                    </Typography>
                  </Box>

                  <Tooltip title="Go to Interview Scheduling">
                    <Button
                      variant="contained"
                      sx={{ mt: 3 }}
                      onClick={() => navigate("/scheduling", { state: { candidate: selected } })}
                    >
                      Proceed to Schedule
                    </Button>
                  </Tooltip>
                </Box>
              </Paper>
            ) : (
              <Typography variant="body2">Select a candidate to view details</Typography>
            )}
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
