import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    InputAdornment,
    Alert,
    CircularProgress,
    Link,
    Divider
} from '@mui/material';
import {
    Email as EmailIcon,
    ArrowBack as ArrowBackIcon,
    CheckCircle as CheckCircleIcon,
    LockReset as LockResetIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import http from '../../http';

function ForgotPassword() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    const formik = useFormik({
        initialValues: {
            email: ""
        },
        validationSchema: yup.object({
            email: yup.string()
                .trim()
                .email('Please enter a valid email address')
                .required('Email is required')
        }),
        onSubmit: async (data) => {
            setIsLoading(true);
            try {
                const payload = {
                    email: data.email.trim().toLowerCase()
                };

                await http.post('/user/forgot-password', payload);
                
                setUserEmail(data.email);
                setEmailSent(true);
                toast.success('Password reset instructions sent to your email!');
                
            } catch (err) {
                console.error('Forgot password error:', err);
                
                if (err.response) {
                    const message = err.response.data?.message || 'Failed to send reset email';
                    toast.error(message);
                } else if (err.request) {
                    toast.error('Unable to connect to server. Please try again later.');
                } else {
                    toast.error('An unexpected error occurred');
                }
            } finally {
                setIsLoading(false);
            }
        }
    });

    const handleBackToLogin = () => {
        navigate('/login');
    };

    const handleResendEmail = () => {
        formik.handleSubmit();
    };

    if (emailSent) {
        return (
            <Box sx={{ 
                minHeight: '100vh', 
                display: 'flex', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2
            }}>
                <Paper
                    elevation={24}
                    sx={{
                        p: { xs: 4, sm: 6 },
                        maxWidth: 480,
                        width: '100%',
                        textAlign: 'center',
                        borderRadius: 4,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                >
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        mb: 3,
                        position: 'relative'
                    }}>
                        <Box sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 24px rgba(76, 175, 80, 0.3)'
                        }}>
                            <CheckCircleIcon sx={{ fontSize: 45, color: 'white' }} />
                        </Box>
                    </Box>
                    
                    <Typography variant="h4" sx={{ 
                        fontWeight: 700, 
                        mb: 2, 
                        color: '#1a1a1a',
                        fontFamily: '"Segoe UI", "Roboto", sans-serif'
                    }}>
                        Check Your Email
                    </Typography>
                    
                    <Typography variant="body1" sx={{ 
                        mb: 3, 
                        color: '#555', 
                        lineHeight: 1.6,
                        fontSize: '1.1rem'
                    }}>
                        We've sent password reset instructions to:
                    </Typography>
                    
                    <Box sx={{ 
                        p: 2, 
                        backgroundColor: '#f8f9ff', 
                        borderRadius: 2, 
                        mb: 4,
                        border: '2px solid #e3f2fd'
                    }}>
                        <Typography variant="h6" sx={{ 
                            color: '#1976d2', 
                            fontWeight: 600,
                            wordBreak: 'break-word'
                        }}>
                            {userEmail}
                        </Typography>
                    </Box>
                    
                    <Alert 
                        severity="info" 
                        sx={{ 
                            mb: 4, 
                            textAlign: 'left',
                            borderRadius: 2,
                            '& .MuiAlert-message': {
                                width: '100%'
                            }
                        }}
                    >
                        <Typography variant="body2" component="div">
                            <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                <li>Check your spam/junk folder if you don't see the email</li>
                                <li>The reset link will expire in 1 hour</li>
                                <li>Contact support if you continue having issues</li>
                            </Box>
                        </Typography>
                    </Alert>

                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                        <Button
                            variant="outlined"
                            onClick={handleResendEmail}
                            disabled={isLoading}
                            sx={{ 
                                flex: 1,
                                py: 1.5,
                                borderColor: '#1976d2',
                                color: '#1976d2',
                                '&:hover': {
                                    borderColor: '#1565c0',
                                    backgroundColor: 'rgba(25, 118, 210, 0.04)'
                                }
                            }}
                        >
                            {isLoading ? <CircularProgress size={20} /> : 'Resend Email'}
                        </Button>
                        
                        <Button
                            variant="contained"
                            onClick={handleBackToLogin}
                            startIcon={<ArrowBackIcon />}
                            sx={{
                                flex: 1,
                                py: 1.5,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                '&:hover': { 
                                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
                                },
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Back to Login
                        </Button>
                    </Box>
                </Paper>
            </Box>
        );
    }

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            display: 'flex',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2
        }}>
            <Paper
                elevation={24}
                sx={{
                    maxWidth: 450,
                    width: '100%',
                    borderRadius: 4,
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
            >
                {/* Header */}
                <Box sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    p: 4,
                    textAlign: 'center',
                    color: 'white'
                }}>
                    <Box sx={{
                        width: 70,
                        height: 70,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                        backdropFilter: 'blur(10px)'
                    }}>
                        <LockResetIcon sx={{ fontSize: 35, color: 'white' }} />
                    </Box>
                    
                    <Typography variant="h4" sx={{ 
                        fontWeight: 700, 
                        mb: 1,
                        fontFamily: '"Segoe UI", "Roboto", sans-serif'
                    }}>
                        AUTOSUME
                    </Typography>
                    
                    <Typography variant="h5" sx={{ 
                        fontWeight: 500,
                        opacity: 0.9
                    }}>
                        Reset Password
                    </Typography>
                </Box>

                {/* Form Content */}
                <Box sx={{ p: 4 }}>
                    <Typography variant="body1" sx={{ 
                        mb: 4, 
                        textAlign: 'center', 
                        color: '#555',
                        fontSize: '1.1rem',
                        lineHeight: 1.6
                    }}>
                        Enter your email address and we'll send you a secure link to reset your password.
                    </Typography>

                    <Box component="form" onSubmit={formik.handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            name="email"
                            type="email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.email && Boolean(formik.errors.email)}
                            helperText={formik.touched.email && formik.errors.email}
                            disabled={isLoading}
                            sx={{ 
                                mb: 4,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    '&:hover fieldset': {
                                        borderColor: '#667eea',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#667eea',
                                    }
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#667eea'
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailIcon sx={{ 
                                            color: formik.touched.email && formik.errors.email ? "error.main" : "#667eea" 
                                        }} />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={isLoading}
                            sx={{
                                py: 1.8,
                                mb: 3,
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                '&:hover': { 
                                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                                },
                                '&:disabled': {
                                    background: '#ccc'
                                },
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {isLoading ? (
                                <CircularProgress size={24} sx={{ color: 'white' }} />
                            ) : (
                                'Send Reset Instructions'
                            )}
                        </Button>

                        <Divider sx={{ mb: 3 }} />

                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                                Remember your password?{' '}
                                <Link
                                    component="button"
                                    type="button"
                                    onClick={handleBackToLogin}
                                    sx={{
                                        color: '#667eea',
                                        textDecoration: 'none',
                                        fontWeight: 600,
                                        '&:hover': { 
                                            textDecoration: 'underline',
                                            color: '#5a6fd8'
                                        }
                                    }}
                                >
                                    Sign in here
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}

export default ForgotPassword;