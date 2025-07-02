// client/src/components/Sidebar.jsx

import React, { useContext } from 'react';
import UserContext from '../contexts/UserContext'; // <-- FIX: Changed to default import
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Avatar,
    Divider,
} from '@mui/material';
import {
    Dashboard,
    Work,
    People,
    Event,
    Settings,
    Help,
    ExitToApp,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 280;

const Sidebar = ({ onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useContext(UserContext);

    const menuItems = [
        { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
        { text: 'Job Management', icon: <Work />, path: '/job-management' },
        { text: 'Resume Shortlisting', icon: <People />, path: '/shortlisting' },
        { text: 'Interview Scheduling', icon: <Event />, path: '/interview-scheduling' },
        { text: 'Settings', icon: <Settings />, path: '/settings' },
        { text: 'Support', icon: <Help />, path: '/support' },
    ];

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    backgroundColor: '#1a2027',
                    color: '#fff',
                },
            }}
        >
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                    AUTOSUME
                </Typography>
            </Box>
            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', p: 2, mt: 2 }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    {user?.username?.[0].toUpperCase()}
                </Avatar>
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                        {user?.username}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {user?.email}
                    </Typography>
                </Box>
            </Box>
            <List sx={{ mt: 2 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            selected={location.pathname === item.path}
                            onClick={() => navigate(item.path)}
                            sx={{
                                '&.Mui-selected': {
                                    backgroundColor: 'rgba(25, 118, 210, 0.2)',
                                    borderRight: '3px solid #1976d2',
                                },
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                },
                            }}
                        >
                            <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Box sx={{ flexGrow: 1 }} />
            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={onLogout}>
                        <ListItemIcon sx={{ color: 'inherit' }}>
                            <ExitToApp />
                        </ListItemIcon>
                        <ListItemText primary="Log Out" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Drawer>
    );
};

export default Sidebar;