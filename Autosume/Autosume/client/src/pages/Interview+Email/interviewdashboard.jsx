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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const statusColor = {
  Scheduled: "success",
  Pending: "warning",
  "Not Sent": "error",
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

  const handleEdit = (row) => {
    const route = row.status === "Scheduled" ? "/emailautomation" : "/scheduling";
    navigate(route, { state: { candidate: row } });
  };

  const handleClearSchedule = async (id) => {
    const confirm = window.confirm("Clear this candidate's interview schedule?");
    if (!confirm) return;

    try {
      const res = await axios.put(`http://localhost:5000/api/interviews/clear/${id}`);
      const updated = res.data.candidate;

      setInterviews((prev) =>
        prev.map((c) => (c._id === id ? updated : c))
      );
    } catch (err) {
      console.error("❌ Clear schedule failed:", err);
      alert("Failed to clear schedule.");
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
    link.download = "interview_dashboard.csv";
    link.click();
  };

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
              <TableCell><strong>Action</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {interviews
              .filter((row) =>
                row.name?.toLowerCase().includes(search) ||
                row.role?.toLowerCase().includes(search)
              )
              .sort((a, b) => {
                const aDate = new Date(`${a.date} ${a.time}`);
                const bDate = new Date(`${b.date} ${b.time}`);
                return aDate - bDate;
              })
              .map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.name}</TableCell>
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
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleEdit(row)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="warning"
                        size="small"
                        onClick={() => handleClearSchedule(row._id)}
                      >
                        🧹 Clear
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
