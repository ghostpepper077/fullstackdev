import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, Box, CircularProgress, Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import MyTheme from './themes/MyTheme';
import UserContext from './contexts/UserContext';
import http from './http';

// Import all pages that actually exist
import Sidebar from './components/Sidebar';
import Login from './pages/UserProfile/Login.jsx';
import Register from './pages/UserProfile/Register.jsx';
import Shortlisting from './pages/Shortlisting/shortlisting.jsx';
import CreateCriteria from './pages/Shortlisting/create-criteria.jsx';
import Profile from './pages/UserProfile/Profile.jsx';
import JobManagement from './pages/JobManagement/mainpage.jsx';
import InterviewScheduling from './pages/Interview+Email/scheduling.jsx';
// import Settings from './pages/Settings/Settings.jsx'; // This file does not exist yet
// import Support from './pages/Support/Support.jsx'; // This file also does not exist, so we comment it out
import ChatbotPage from './pages/Chatbot/ChatbotPage.jsx';
import ForgotPassword from './pages/UserProfile/ForgotPassword.jsx';

// Main App Component
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await http.get('/api/auth/profile');
          setUser(res.data);
        } catch (error) {
          console.error("Session expired or token is invalid:", error);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Router>
        <ThemeProvider theme={MyTheme}>
          {user ? (
            // Authenticated user layout
            <Box sx={{ display: 'flex' }}>
              <Sidebar user={user} onLogout={logout} />
              <Box component="main" sx={{ flexGrow: 1, p: 3, marginLeft: '280px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/job-management" element={<JobManagement />} />
                  <Route path="/shortlisting" element={<Shortlisting />} />
                  <Route path="/create-criteria" element={<CreateCriteria />} />
                  <Route path="/interview-scheduling" element={<InterviewScheduling />} />
                  {/* <Route path="/settings" element={<Settings />} /> */}
                  {/* <Route path="/support" element={<Support />} /> */}
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/chatbot" element={<ChatbotPage />} />
                  <Route path="/login" element={<Navigate to="/dashboard" />} />
                  <Route path="/register" element={<Navigate to="/dashboard" />} />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </Box>
            </Box>
          ) : (
            // Public layout
            <Container>
              <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgotpassword" element={<ForgotPassword />} />
                <Route path="*" element={<Navigate to="/login" />} />
              </Routes>
            </Container>
          )}
        </ThemeProvider>
      </Router>
    </UserContext.Provider>
  );
}

// Simple placeholder for your Dashboard component
function Dashboard() {
  const { user } = useContext(UserContext);
  return (
    <Box>
      <Typography variant="h4" fontWeight={600}>Dashboard</Typography>
      <Typography variant="h6" sx={{ mt: 2 }}>
        Welcome back, {user?.username}!
      </Typography>
    </Box>
  );
}

export default App;