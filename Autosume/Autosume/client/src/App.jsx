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
import Create from './pages/JobManagement/Create'; // Add this import
import http from './http';
import UserContext from './contexts/UserContext';
import ChatbotPage from './pages/Chatbot/ChatbotPage';
import ForgotPassword from './pages/UserProfile/ForgotPassword';
import ResumeShortlisting from './pages/Shortlisting/ResumeShortlisting';
import CreateCriteria from './pages/Shortlisting/create-criteria';
import Profile from './pages/UserProfile/Profile';
import Interview from './pages/Interview+Email/shortlistoverview';
import InterviewScheduling from './pages/Interview+Email/scheduling';
import EmailAutomation from './pages/Interview+Email/emailautomation';
import InterviewDashboard from './pages/Interview+Email/interviewdashboard';
import Sidebar from './components/Sidebar';
// ===================================================================

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      http.get('/user/auth').then((res) => {
        setUser(res.data.user);
        setLoading(false);
      }).catch(() => {
        localStorage.clear();
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location = "/login";
  };

  if (loading) {
    return (
      <ThemeProvider theme={MyTheme}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}>
          <div>Loading...</div>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Router>
        <ThemeProvider theme={MyTheme}>
          {user ? (
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
              <Sidebar user={user} onLogout={logout} />
              <Box sx={{
                flex: 1,
                marginLeft: '280px',
                backgroundColor: '#f5f5f5',
                minHeight: '100vh'
              }}>
                <Container maxWidth="xl" sx={{ py: 3 }}>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/support" element={<Support />} />
                    <Route path="/form" element={<MyForm />} />
                    <Route path="/profile" element={<Profile />} />
                    {/* Updated Job Management Routes */}
                    <Route path="/job-management" element={<JobManagement />} />
                    <Route path="/jobs/create" element={<Create />} />  {/* create route without id */}
                    <Route path="/jobs/edit/:id" element={<Create />} /> {/* edit route with id */}

                    <Route path="/ResumeShortlisting" element={<ResumeShortlisting />} />
                    <Route path="/create-criteria" element={<CreateCriteria />} />
                    {/* =================================================================== */}
  
                    <Route path="/shortlistoverview" element={<Interview />} />
                    <Route path="/scheduling" element={<InterviewScheduling />} />
                    <Route path="/emailautomation" element={<EmailAutomation />} />
                    <Route path="/interviewdashboard" element={<InterviewDashboard />} />
                    <Route path="/chatbot" element={<ChatbotPage />} />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    <Route path="/login" element={<Navigate to="/dashboard" />} />
                    <Route path="/register" element={<Navigate to="/dashboard" />} />
                    <Route path="/forgotpassword" element={<Navigate to="/dashboard" />} />
                  </Routes>
                </Container>
              </Box>
            </Box>
          ) : (
            <Box sx={{ minHeight: '100vh' }}>
              <Container>
                <Routes>
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/forgotpassword" element={<ForgotPassword />} />
                  <Route path="/" element={<Navigate to="/login" />} />
                  <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
              </Container>
            </Box>
          )}
        </ThemeProvider>
      </Router>
    </UserContext.Provider>
  );
}

// Dashboard component - Welcome/About page
function Dashboard() {
  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '3rem', color: '#2c3e50', marginBottom: '20px' }}>Welcome to Autosume</h1>
        <p style={{ fontSize: '1.3rem', color: '#7f8c8d', lineHeight: '1.6' }}>
          Streamlining recruitment processes with innovative technology solutions
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '50px' }}>
        <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#3498db', marginBottom: '15px' }}>🚀 Modern Solutions</h3>
          <p style={{ color: '#555', lineHeight: '1.6' }}>
            Our platform leverages cutting-edge technology to make hiring faster, smarter, and more efficient than ever before.
          </p>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#e74c3c', marginBottom: '15px' }}>👥 Expert Team</h3>
          <p style={{ color: '#555', lineHeight: '1.6' }}>
            Built by developers who understand the challenges of finding the right talent in today's competitive market.
          </p>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#2ecc71', marginBottom: '15px' }}>📈 Smart Automation</h3>
          <p style={{ color: '#555', lineHeight: '1.6' }}>
            Automate repetitive hiring tasks like resume screening and interview scheduling to save valuable time.
          </p>
        </div>
      </div>

      <div style={{ backgroundColor: '#f8f9fa', padding: '40px', borderRadius: '15px', textAlign: 'center' }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>Ready to Transform Your Hiring?</h2>
        <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '30px', lineHeight: '1.6' }}>
          Join us in revolutionising your recruitment process with our comprehensive platform.
          From job posting to candidate selection, we've got everything you need.
        </p>
        <button style={{
          backgroundColor: '#3498db',
          color: 'white',
          padding: '15px 30px',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1.1rem',
          cursor: 'pointer',
          transition: 'background-color 0.3s'
        }}>
          Get Started Today
        </button>
      </div>
    </div>
  );
}

// Support component - Help/Contact page
function Support() {
  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '3rem', color: '#2c3e50', marginBottom: '20px' }}>Need Help?</h1>
        <p style={{ fontSize: '1.3rem', color: '#7f8c8d', lineHeight: '1.6' }}>
          We're here to support you every step of the way
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px', marginBottom: '50px' }}>
        <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '15px', boxShadow: '0 6px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📞</div>
            <h3 style={{ color: '#3498db', marginBottom: '15px' }}>Phone Support</h3>
          </div>
          <p style={{ color: '#555', lineHeight: '1.6', marginBottom: '20px' }}>
            Speak directly with our support team for immediate assistance with any questions or issues.
          </p>
          <p style={{ color: '#2c3e50', fontWeight: 'bold', fontSize: '1.2rem' }}>+65 9397 9142</p>
          <p style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Monday - Friday, 9AM - 6PM SGT</p>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '15px', boxShadow: '0 6px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>✉️</div>
            <h3 style={{ color: '#e74c3c', marginBottom: '15px' }}>Email Support</h3>
          </div>
          <p style={{ color: '#555', lineHeight: '1.6', marginBottom: '20px' }}>
            Send us a detailed message and we'll get back to you within 24 hours with a comprehensive solution.
          </p>
          <p style={{ color: '#2c3e50', fontWeight: 'bold', fontSize: '1.2rem' }}>support@autosume.com</p>
          <p style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Average response time: 4 hours</p>
        </div>
      </div>

      <div style={{ backgroundColor: '#f8f9fa', padding: '40px', borderRadius: '15px', marginBottom: '40px' }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '30px', textAlign: 'center' }}>Frequently Asked Questions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
          <div>
            <h4 style={{ color: '#3498db', marginBottom: '10px' }}>How do I reset my password?</h4>
            <p style={{ color: '#666', lineHeight: '1.5' }}>Click on "Forgot Password" on the login page and follow the instructions sent to your email.</p>
          </div>
          <div>
            <h4 style={{ color: '#3498db', marginBottom: '10px' }}>What does Autosume do?</h4>
            <p style={{ color: '#666', lineHeight: '1.5' }}>
              Autosume is a platform designed to streamline and simplify the recruitment process to save time and improve hiring outcomes.
            </p>
          </div>
          <div>
            <h4 style={{ color: '#3498db', marginBottom: '10px' }}>How do I export my data?</h4>
            <p style={{ color: '#666', lineHeight: '1.5' }}>Go to Settings to Data Export to download all your information in CSV or PDF format.</p>
          </div>
          <div>
            <h4 style={{ color: '#3498db', marginBottom: '10px' }}>Is my data secure?</h4>
            <p style={{ color: '#666', lineHeight: '1.5' }}>Absolutely! We use encryption and follow industry best practices for data protection.</p>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', backgroundColor: '#fff', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>Still Need Help?</h2>
        <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '30px', lineHeight: '1.6' }}>
          Our dedicated support team is always ready to assist you. Don't hesitate to reach out!
        </p>
        <button style={{
          backgroundColor: '#2ecc71',
          color: 'white',
          padding: '15px 30px',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1.1rem',
          cursor: 'pointer',
          marginRight: '15px'
        }}>
          Contact Support
        </button>
        <button style={{
          backgroundColor: '#95a5a6',
          color: 'white',
          padding: '15px 30px',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1.1rem',
          cursor: 'pointer'
        }}>
          Live Chat
        </button>
      </div>
    </div>
  );
}

export default App;