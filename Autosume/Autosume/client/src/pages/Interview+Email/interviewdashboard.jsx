import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  TextField,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const mockInterviews = [
  {
    name: 'Samanta Wong',
    role: 'UI/UX Designer',
    date: '2024-07-08',
    time: '10:00 AM',
    interviewer: 'Jace Lim',
    status: 'Scheduled',
    email: 'wongsamanta_23@gmail.com',
    phone: '+65 8012 3040',
    skills: ['Figma', 'UI/UX', 'Prototyping'],
  },
  {
    name: 'Jason Lim',
    role: 'Data Scientist',
    date: '2024-07-10',
    time: '2:00 PM',
    interviewer: 'Amira Soh',
    status: 'Pending',
    email: 'jason.lim@email.com',
    phone: '+65 8123 9988',
    skills: ['Python', 'Pandas', 'ML'],
  },
  {
    name: 'Audrey Hall',
    role: 'Solution Architect',
    date: '-',
    time: '-',
    interviewer: '-',
    status: 'Not Sent',
    email: 'audrey.hall@email.com',
    phone: '+65 9012 1234',
    skills: ['React', 'Node.js', 'Architecture'],
  },
];

const statusColor = {
  Scheduled: 'success',
  Pending: 'warning',
  'Not Sent': 'error',
};

export default function InterviewDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleEdit = (row) => {
    const route = row.status === 'Scheduled' ? '/emailautomation' : '/scheduling';
    navigate(route, {
      state: {
        candidate: {
          name: row.name,
          role: row.role,
          email: row.email,
          phone: row.phone,
          skills: row.skills,
        },
        interview: {
          date: row.date,
          time: row.time,
          interviewer: row.interviewer,
        },
      },
    });
  };

  return (
    <Box p={5} bgcolor="#f5f5f5" minHeight="100vh">
      <Typography variant="h4" fontWeight={600} gutterBottom>
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

      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Interviewer</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {mockInterviews
              .filter(
                (row) =>
                  row.name.toLowerCase().includes(search) ||
                  row.role.toLowerCase().includes(search)
              )
              .map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.role}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.time}</TableCell>
                  <TableCell>{row.interviewer}</TableCell>
                  <TableCell>
                    <Chip label={row.status} color={statusColor[row.status]} />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleEdit(row)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
