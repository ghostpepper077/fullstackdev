// Create this file as: src/components/Sidebar.jsx
import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Button
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Work as WorkIcon,
  FindInPage as ShortlistIcon,
  CalendarMonth as InterviewIcon,
  Settings as SettingsIcon,
  Support as SupportIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Job Management', icon: <WorkIcon />, path: '/job-management' },
    { text: 'Resume Shortlisting', icon: <ShortlistIcon />, path: '/shortlisting' },
    { text: 'Interview Scheduling', icon: <InterviewIcon />, path: '/interview' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/profile' },
    { text: 'Support', icon: <SupportIcon />, path: '/support' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Box
      sx={{
        width: 280,
        height: '100vh',
        backgroundColor: '#000000',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1200,
        boxShadow: '4px 0 20px rgba(0, 0, 0, 0.22)',
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          display: 'none',
        },
        scrollbarWidth: 'none', // Firefox
        msOverflowStyle: 'none', // IE and Edge
      }}
    >
      {/* Logo Section */}
      <Box sx={{ p: 0, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <img
          src="src\assets\autosume_logo.png"
          alt="Autosume Logo"
          style={{
            width: '100%',
            height: 180, 
            objectFit: 'cover',
            display: 'block',
            background: 'linear-gradient(135deg,hsl(229, 75.90%, 65.90%) 0%, #764ba2 100%)'
          }}
        />
      </Box>

      {/* User Profile Section */}
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{
              width: 50,
              height: 50,
              mr: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{
              fontWeight: 600,
              color: 'white',
              fontSize: '1rem'
            }}>
              {user?.name || 'User'}
            </Typography>
            <Typography variant="body2" sx={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.85rem'
            }}>
              {user?.email || 'user@email.com'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, py: 2 }}>
        <List sx={{ px: 2 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    px: 2,
                    backgroundColor: isActive ? 'rgba(102, 126, 234, 0.2)' : 'transparent',
                    border: isActive ? '1px solid rgba(102, 126, 234, 0.3)' : '1px solid transparent',
                    '&:hover': {
                      backgroundColor: isActive
                        ? 'rgba(102, 126, 234, 0.3)'
                        : 'rgba(255,255,255,0.05)',
                      transform: 'translateX(4px)',
                      transition: 'all 0.2s ease'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <ListItemIcon sx={{
                    color: isActive ? '#667eea' : 'rgba(255,255,255,0.7)',
                    minWidth: 40
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontSize: '0.95rem',
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? '#667eea' : 'rgba(255,255,255,0.9)'
                      }
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Logout Section */}
      <Box sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={onLogout}
          sx={{
            color: 'rgba(255,255,255,0.8)',
            borderColor: 'rgba(255,255,255,0.2)',
            py: 1.5,
            borderRadius: 2,
            '&:hover': {
              backgroundColor: 'rgba(255, 82, 82, 0.1)',
              borderColor: 'rgba(255, 82, 82, 0.3)',
              color: '#ff5252',
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          Log Out
        </Button>
      </Box>
    </Box>
  );
};

export default Sidebar;