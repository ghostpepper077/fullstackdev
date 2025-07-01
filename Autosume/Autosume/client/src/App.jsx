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
import ChatbotPage from './pages/Chatbot/ChatbotPage';
import ForgotPassword from './pages/UserProfile/ForgotPassowrd';
import Shortlisting from './pages/Shortlisting/Shortlisting';
import Profile from './pages/UserProfile/Profile';
import Interview from './pages/Interview+Email/interview';
import Sidebar from './components/Sidebar';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      http.get('/user/auth').then((res) => {
        setUser(res.data.user);
        setLoading(false); // Set loading to false after successful auth
      }).catch(() => {
        localStorage.clear();
        setLoading(false); // Set loading to false even if auth fails
      });
    } else {
      setLoading(false); // No token, so not loading anymore
    }
  }, []);

  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location = "/login";
  };

  // Show loading spinner or nothing while checking authentication
  if (loading) {
    return (
      <ThemeProvider theme={MyTheme}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh' 
        }}>
          <div>Loading...</div> {/* You can replace this with a proper loading component */}
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Router>
        <ThemeProvider theme={MyTheme}>
          <AppBar position="static" className="AppBar">
            <Container>
              <Toolbar disableGutters={true}>
                <Link to="/">
                  <Typography variant="h6" component="div">
                    Autosume
                  </Typography>
                </Link>
                <Box sx={{ flexGrow: 1 }}></Box>
                {user && (
                  <>
                    <Typography>{user.name}</Typography>
                    <Button onClick={logout}>Logout</Button>
                  </>
                )}
                {!user && (
                  <>
                    <Link to="/register">
                      <Typography>Register</Typography>
                    </Link>
                    <Link to="/login">
                      <Typography>Login</Typography>
                    </Link>
                  </>
                )}
              </Toolbar>
            </Container>
          </AppBar>

          <Container>
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/form" element={<MyForm />} />
              <Route path="/shortlisting" element={<Shortlisting />} />
              <Route path="/" element={<JobManagement />} />
              <Route path="/chatbot" element={<ChatbotPage />} />
            </Routes>
          </Container>

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