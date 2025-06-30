import './App.css';
import { useState, useEffect } from 'react';
import { Container, Box } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import MyTheme from './themes/MyTheme';
import MyForm from './pages/UserProfile/MyForm';
import Register from './pages/UserProfile/Register';
import Login from './pages/UserProfile/Login';
import JobManagement from './pages/JobManagement/mainpage';
import http from './http';
import UserContext from './contexts/UserContext';
import ForgotPassword from './pages/UserProfile/ForgotPassowrd';
import Shortlisting from './pages/Shortlisting/Shortlisting';
import Profile from './pages/UserProfile/Profile';
import Interview from './pages/Interview+Email/interview';
import Sidebar from './components/Sidebar';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      http.get('/user/auth').then((res) => {
        setUser(res.data.user);
      }).catch(() => {
        localStorage.clear();
      });
    }
  }, []);

  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location = "/login";
  };

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Router>
        <ThemeProvider theme={MyTheme}>
          {user ? (
            // Authenticated layout with sidebar
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
              <Sidebar user={user} onLogout={logout} />
              <Box sx={{ 
                flex: 1, 
                marginLeft: '280px', // Account for fixed sidebar width
                backgroundColor: '#f5f5f5',
                minHeight: '100vh'
              }}>
                <Container maxWidth="xl" sx={{ py: 3 }}>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/form" element={<MyForm />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/job-management" element={<JobManagement />} />
                    <Route path="/shortlisting" element={<Shortlisting />} />
                    <Route path="/interview" element={<Interview />} />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    <Route path="/login" element={<Navigate to="/dashboard" />} />
                    <Route path="/register" element={<Navigate to="/dashboard" />} />
                    <Route path="/forgotpassword" element={<Navigate to="/dashboard" />} />
                  </Routes>
                </Container>
              </Box>
            </Box>
          ) : (
            // Non-authenticated layout (no sidebar)
            <Box sx={{ minHeight: '100vh' }}>
              <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgotpassword" element={<ForgotPassword />} />
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="*" element={<Navigate to="/login" />} />
              </Routes>
            </Box>
          )}
        </ThemeProvider>
      </Router>
    </UserContext.Provider>
  );
}

// Simple Dashboard component
function Dashboard() {
  return (
    <Box>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard!</p>
    </Box>
  );
}

export default App;