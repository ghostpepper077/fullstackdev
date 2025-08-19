// interviewdashboard.jsx
import React, { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
  Paper, Chip, Button, TextField, Stack, Tooltip,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import UndoIcon from "@mui/icons-material/Undo";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // ✅ use same absolute base as other pages

// Dashboard badge colors
const statusColor = { Scheduled: "success", Pending: "warning", Unscheduled: "error" };

export default function InterviewDashboard() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [note, setNote] = useState("");
  const navigate = useNavigate();

  // Normalize for display (keep your Screened->Unscheduled rule)
  const normalize = (r) => ({
    _id: r._id,
    name: r.name || "Unknown",
    role: r.role || "—",
    email: r.email || "",
    phone: r.phone || "",
    date: r.date || "-",
    time: r.time || "-",
    interviewer: r.interviewer || "-",
    status: !r.status || r.status === "Screened" || r.status === "Not Sent" ? "Unscheduled" : r.status,
  });

  useEffect(() => {
    (async () => {
      try {
        // ✅ single source of truth – the ScreenedCandidate docs with schedule fields
        const res = await axios.get("http://localhost:5000/api/interviews/all");
        const list = Array.isArray(res.data) ? res.data.map(normalize) : [];
        setRows(list);
        if (list.length === 0) setNote("No records. Try scheduling someone first.");
      } catch (err) {
        console.error("Dashboard load failed:", err);
        setNote("Failed to load interviews. Check server and CORS.");
      }
    })();
  }, []);

  const handleSchedule = (row) => navigate("/scheduling", { state: { candidate: row } });

  const handleUnschedule = async (id) => {
    if (!id) return;
    const ok = window.confirm("Withdraw this candidate's interview?");
    if (!ok) return;
    try {
      // ✅ same base as the other pages
      await axios.put(`http://localhost:5000/api/interviews/clear/${id}`);
      // ✅ reflect instantly
      setRows((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, date: "-", time: "-", interviewer: "-", status: "Unscheduled" } : r
        )
      );
    } catch (err) {
      console.error("Withdraw failed:", err?.response?.data || err);
      alert("Failed to withdraw interview.");
    }
  };

  const handleExportCSV = () => {
    const headers = ["Name", "Role", "Date", "Time", "Interviewer", "Status", "Email", "Phone"];
    const out = rows.map((i) => [i.name, i.role, i.date, i.time, i.interviewer, i.status, i.email, i.phone].join(","));
    const csv = [headers.join(","), ...out].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `interview_dashboard_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const filtered = rows
    .filter((row) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        row.name?.toLowerCase().includes(q) ||
        row.role?.toLowerCase().includes(q) ||
        row.email?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const ad = new Date(`${a.date} ${a.time}`);
      const bd = new Date(`${b.date} ${b.time}`);
      if (isNaN(ad) && isNaN(bd)) return 0;
      if (isNaN(ad)) return 1;
      if (isNaN(bd)) return -1;
      return ad - bd;
    });

  return (
    <Box p={5} bgcolor="#f0f2f5" minHeight="100vh">
      <Typography variant="h4" fontWeight={600} gutterBottom color="primary">
        Interview Dashboard
      </Typography>

      <TextField
        label="Search by name, role, or email"
        variant="outlined"
        size="small"
        fullWidth
        sx={{ my: 3 }}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Button variant="outlined" color="success" onClick={handleExportCSV} sx={{ mb: 2 }}>
        ⬇️ Export CSV
      </Button>

      <Paper elevation={3}>
        <Table>
          <TableHead sx={{ backgroundColor: "#e3f2fd" }}>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Role</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Time</strong></TableCell>
              <TableCell><strong>Interviewer</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Manage</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {note && (
              <TableRow>
                <TableCell colSpan={7} style={{ color: "#666" }}>
                  {note}
                </TableCell>
              </TableRow>
            )}

            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">🔍 No candidates found.</TableCell>
              </TableRow>
            ) : (
              filtered.map((row, index) => (
                <TableRow key={row._id || row.email || index}>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color="primary"
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleSchedule(row)}
                    >
                      {row.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{row.role}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.time}</TableCell>
                  <TableCell>{row.interviewer}</TableCell>
                  <TableCell>
                    <Chip label={row.status} color={statusColor[row.status] || "default"} variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {row.status === "Unscheduled" && (
                        <Tooltip title="Assign an interview slot">
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={<AssignmentIcon />}
                            onClick={() => handleSchedule(row)}
                          >
                            Assign
                          </Button>
                        </Tooltip>
                      )}
                      {row.status === "Scheduled" && (
                        <Tooltip title="Withdraw interview assignment">
                          <Button
                            variant="outlined"
                            color="warning"
                            size="small"
                            startIcon={<UndoIcon />}
                            onClick={() => handleUnschedule(row._id)}
                            disabled={!row._id}
                          >
                            Withdraw
                          </Button>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
