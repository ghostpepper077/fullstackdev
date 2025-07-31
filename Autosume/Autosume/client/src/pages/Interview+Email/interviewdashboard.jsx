import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Chip,
  Button,
  TextField,
  Stack,
  Tooltip,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import UndoIcon from "@mui/icons-material/Undo";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const statusColor = {
  Scheduled: "success",
  Pending: "warning",
  Unscheduled: "error",
};

export default function InterviewDashboard() {
  const [interviews, setInterviews] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/interviews/all")
      .then((res) => setInterviews(res.data))
      .catch((err) => console.error("❌ Failed to fetch interviews:", err));
  }, []);

  const handleSchedule = (row) => {
    const route = "/scheduling";
    navigate(route, { state: { candidate: row } });
  };

  const handleUnschedule = async (id) => {
    const confirm = window.confirm("Withdraw this candidate's interview?");
    if (!confirm) return;

    try {
      const res = await axios.put(`http://localhost:5000/api/interviews/clear/${id}`);
      const updated = res.data.candidate;

      setInterviews((prev) =>
        prev.map((c) => (c._id === id ? updated : c))
      );
    } catch (err) {
      console.error("❌ Withdraw failed:", err);
      alert("Failed to withdraw interview.");
    }
  };

  const handleExportCSV = () => {
    const headers = ["Name", "Role", "Date", "Time", "Interviewer", "Status", "Email", "Phone"];
    const rows = interviews.map((i) =>
      [i.name, i.role, i.date, i.time, i.interviewer, i.status, i.email, i.phone].join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `interview_dashboard_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const isToday = (date) => {
    return new Date(date).toDateString() === new Date().toDateString();
  };

  const filtered = interviews
    .map((row) => ({
      ...row,
      status: row.status === "Not Sent" ? "Unscheduled" : row.status,
    }))
    .filter((row) =>
      row.name?.toLowerCase().includes(search) ||
      row.role?.toLowerCase().includes(search)
    )
    .sort((a, b) => {
      const aDate = new Date(`${a.date} ${a.time}`);
      const bDate = new Date(`${b.date} ${b.time}`);
      return aDate - bDate;
    });

  return (
    <Box p={5} bgcolor="#f0f2f5" minHeight="100vh">
      <Typography variant="h4" fontWeight={600} gutterBottom color="primary">
        Interview Dashboard
      </Typography>

      <TextField
        label="Search by name or role"
        variant="outlined"
        size="small"
        fullWidth
        sx={{ my: 3 }}
        onChange={(e) => setSearch(e.target.value.toLowerCase())}
      />

      <Button
        variant="outlined"
        color="success"
        onClick={handleExportCSV}
        sx={{ mb: 2 }}
      >
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
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  🔍 No interviews found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row, index) => (
                <TableRow
                  key={index}
                  sx={{
                    backgroundColor: isToday(row.date) ? "#fffde7" : "inherit",
                  }}
                >
                  <TableCell>
                    <Typography
                      variant="body2"
                      color="primary"
                      sx={{ cursor: "pointer" }}
                      onClick={() => navigate("/scheduling", { state: { candidate: row } })}
                    >
                      {row.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{row.role}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.time}</TableCell>
                  <TableCell>{row.interviewer}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.status}
                      color={statusColor[row.status] || "default"}
                      variant="outlined"
                    />
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
