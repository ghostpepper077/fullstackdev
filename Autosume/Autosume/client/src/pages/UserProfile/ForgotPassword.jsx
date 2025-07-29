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
    Divider,
    IconButton
} from '@mui/material';
import {
    Email as EmailIcon,
    ArrowBack as ArrowBackIcon,
    CheckCircle as CheckCircleIcon,
    LockReset as LockResetIcon,
    Lock as LockIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    VerifiedUser as VerifiedUserIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import http from '../../http';
import 'react-toastify/dist/ReactToastify.css';

function ForgotPassword() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [passwordReset, setPasswordReset] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Email form to send OTP
    const emailFormik = useFormik({
        initialValues: {
            email: ""
        },
        validationSchema: yup.object({
            email: yup.string()
                .trim()
                .email('Enter a valid email')
                .max(50, 'Email must be at most 50 characters')
                .required('Email is required')
        }),
        onSubmit: async (data) => {
            setIsLoading(true);
            try {
                const payload = {
                    email: data.email.trim().toLowerCase()
                };

                const response = await http.post('/user/send-reset-otp', payload);
                console.log('OTP sent response:', response.data);

                setUserEmail(data.email.trim().toLowerCase());
                setEmailSent(true);
                toast.success('Verification code sent to your email!');

            } catch (err) {
                console.error('Send OTP error:', err);
                toast.error(`${err.response?.data?.message || 'Failed to send verification code'}`);
            } finally {
                setIsLoading(false);
            }
        }
    });

    // OTP verification form
    const otpFormik = useFormik({
        initialValues: {
            otp: ""
        },
        validationSchema: yup.object({
            otp: yup.string()
                .trim()
                .required('Verification code is required')
                .length(6, 'Verification code must be 6 digits')
                .matches(/^\d+$/, 'Verification code must contain only numbers')
        }),
        onSubmit: async (data) => {
            setIsLoading(true);
            try {
                const payload = {
                    email: userEmail,
                    otp: data.otp.trim()
                };

                const response = await http.post('/user/verify-reset-otp', payload);
                console.log('OTP verification response:', response.data);

                setOtpVerified(true);
                toast.success('Verification code verified successfully!');

            } catch (err) {
                console.error('OTP verification error:', err);
                toast.error(`${err.response?.data?.message || 'Invalid or expired verification code'}`);
            } finally {
                setIsLoading(false);
            }
        }
    });

    // Password reset form
    const passwordFormik = useFormik({
        initialValues: {
            password: "",
            confirmPassword: ""
        },
        validationSchema: yup.object({
            password: yup.string()
                .trim()
                .min(8, 'Password must be at least 8 characters')
                .max(50, 'Password must be at most 50 characters')
                .required('Password is required')
                .matches(/^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/, "Password must contain at least 1 letter and 1 number"),
            confirmPassword: yup.string()
                .trim()
                .required('Confirm password is required')
                .oneOf([yup.ref('password')], 'Passwords must match')
        }),
        onSubmit: async (data) => {
            setIsLoading(true);
            
            const payload = {
                email: userEmail,
                password: data.password.trim()
            };
            
            console.log('Payload being sent:', payload);
            
            try {
                const response = await http.put('/user/reset-password', payload);
                console.log('Password reset response:', response.data);

                setPasswordReset(true);
                toast.success('Password reset successfully!');

                // Auto redirect after 2 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 2000);

            } catch (err) {
                console.error('Password reset error:', err);
                
                if (err.response) {
                    const message = err.response.data?.message || `Server error: ${err.response.status}`;
                    toast.error(message);
                } else if (err.request) {
                    toast.error('No response from server. Please check if the server is running.');
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

    const handleBackToEmail = () => {
        setEmailSent(false);
        setOtpVerified(false);
        setUserEmail('');
        emailFormik.resetForm();
        otpFormik.resetForm();
        passwordFormik.resetForm();
    };

    const handleBackToOtp = () => {
        setOtpVerified(false);
        otpFormik.resetForm();
        passwordFormik.resetForm();
    };

    const handleResendOtp = async () => {
        setIsLoading(true);
        try {
            const payload = { email: userEmail };
            const response = await http.post('/user/send-reset-otp', payload);
            toast.success('New verification code sent to your email!');
        } catch (err) {
            console.error('Resend OTP error:', err);
            toast.error('Failed to resend verification code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    // Success screen after password reset
    if (passwordReset) {
        return (
            <>
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
                            Password Reset Complete!
                        </Typography>

                        <Typography variant="body1" sx={{
                            mb: 4,
                            color: '#555',
                            lineHeight: 1.6,
                            fontSize: '1.1rem'
                        }}>
                            Your password has been successfully reset. You can now sign in with your new password.
                        </Typography>

                        <Button
                            variant="contained"
                            onClick={handleBackToLogin}
                            startIcon={<ArrowBackIcon />}
                            fullWidth
                            sx={{
                                py: 1.5,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
                                },
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Continue to Login
                        </Button>
                    </Paper>
                </Box>
                <ToastContainer />
            </>
        );
    }

    // Password reset form screen
    if (otpVerified) {
        return (
            <>
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
                                <LockIcon sx={{ fontSize: 35, color: 'white' }} />
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
                                Set New Password
                            </Typography>
                        </Box>

                        {/* Form Content */}
                        <Box sx={{ p: 4 }}>
                            <Alert
                                severity="success"
                                sx={{
                                    mb: 3,
                                    borderRadius: 2
                                }}
                            >
                                Email verified: {userEmail}
                            </Alert>

                            <Typography variant="body1" sx={{
                                mb: 4,
                                textAlign: 'center',
                                color: '#555',
                                fontSize: '1.1rem',
                                lineHeight: 1.6
                            }}>
                                Please enter your new password below.
                            </Typography>

                            <Box component="form" onSubmit={passwordFormik.handleSubmit}>
                                <TextField
                                    fullWidth
                                    margin="dense"
                                    autoComplete="off"
                                    label="New Password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={passwordFormik.values.password}
                                    onChange={passwordFormik.handleChange}
                                    onBlur={passwordFormik.handleBlur}
                                    error={passwordFormik.touched.password && Boolean(passwordFormik.errors.password)}
                                    helperText={passwordFormik.touched.password && passwordFormik.errors.password}
                                    disabled={isLoading}
                                    sx={{
                                        mb: 3,
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
                                                <LockIcon sx={{
                                                    color: passwordFormik.touched.password && passwordFormik.errors.password ? "error.main" : "#667eea"
                                                }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={togglePasswordVisibility}
                                                    edge="end"
                                                    sx={{ color: '#667eea' }}
                                                >
                                                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <TextField
                                    fullWidth
                                    margin="dense"
                                    autoComplete="off"
                                    label="Confirm New Password"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={passwordFormik.values.confirmPassword}
                                    onChange={passwordFormik.handleChange}
                                    onBlur={passwordFormik.handleBlur}
                                    error={passwordFormik.touched.confirmPassword && Boolean(passwordFormik.errors.confirmPassword)}
                                    helperText={passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword}
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
                                                <LockIcon sx={{
                                                    color: passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword ? "error.main" : "#667eea"
                                                }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={toggleConfirmPasswordVisibility}
                                                    edge="end"
                                                    sx={{ color: '#667eea' }}
                                                >
                                                    {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    disabled={isLoading || passwordFormik.isSubmitting}
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
                                    {isLoading || passwordFormik.isSubmitting ? (
                                        <CircularProgress size={24} sx={{ color: 'white' }} />
                                    ) : (
                                        'Reset Password'
                                    )}
                                </Button>

                                <Divider sx={{ mb: 3 }} />

                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                    <Link
                                        component="button"
                                        type="button"
                                        onClick={handleBackToOtp}
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
                                        Back to OTP
                                    </Link>
                                    <Typography variant="body2" sx={{ color: '#666' }}>
                                        •
                                    </Typography>
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
                                        Back to Login
                                    </Link>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </Box>
                <ToastContainer />
            </>
        );
    }

    // OTP verification screen
    if (emailSent) {
        return (
            <>
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
                                <VerifiedUserIcon sx={{ fontSize: 35, color: 'white' }} />
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
                                Verify Code
                            </Typography>
                        </Box>

                        {/* Form Content */}
                        <Box sx={{ p: 4 }}>
                            <Alert
                                severity="info"
                                sx={{
                                    mb: 3,
                                    borderRadius: 2
                                }}
                            >
                                Code sent to: {userEmail}
                            </Alert>

                            <Typography variant="body1" sx={{
                                mb: 4,
                                textAlign: 'center',
                                color: '#555',
                                fontSize: '1.1rem',
                                lineHeight: 1.6
                            }}>
                                Enter the 6-digit verification code sent to your email.
                            </Typography>

                            <Box component="form" onSubmit={otpFormik.handleSubmit}>
                                <TextField
                                    fullWidth
                                    margin="dense"
                                    autoComplete="off"
                                    label="Verification Code"
                                    name="otp"
                                    type="text"
                                    inputProps={{ 
                                        maxLength: 6,
                                        style: { 
                                            textAlign: 'center',
                                            fontSize: '1.5rem',
                                            letterSpacing: '0.5rem',
                                            fontFamily: 'monospace'
                                        }
                                    }}
                                    value={otpFormik.values.otp}
                                    onChange={otpFormik.handleChange}
                                    onBlur={otpFormik.handleBlur}
                                    error={otpFormik.touched.otp && Boolean(otpFormik.errors.otp)}
                                    helperText={otpFormik.touched.otp && otpFormik.errors.otp}
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
                                                <VerifiedUserIcon sx={{
                                                    color: otpFormik.touched.otp && otpFormik.errors.otp ? "error.main" : "#667eea"
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
                                    disabled={isLoading || otpFormik.isSubmitting}
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
                                    {isLoading || otpFormik.isSubmitting ? (
                                        <CircularProgress size={24} sx={{ color: 'white' }} />
                                    ) : (
                                        'Verify Code'
                                    )}
                                </Button>

                                <Box sx={{ textAlign: 'center', mb: 3 }}>
                                    <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                                        Didn't receive the code?
                                    </Typography>
                                    <Button
                                        variant="text"
                                        onClick={handleResendOtp}
                                        disabled={isLoading}
                                        sx={{
                                            color: '#667eea',
                                            fontWeight: 600,
                                            '&:hover': {
                                                backgroundColor: 'rgba(102, 126, 234, 0.1)'
                                            }
                                        }}
                                    >
                                        Resend Code
                                    </Button>
                                </Box>

                                <Divider sx={{ mb: 3 }} />

                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                    <Link
                                        component="button"
                                        type="button"
                                        onClick={handleBackToEmail}
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
                                        Change Email
                                    </Link>
                                    <Typography variant="body2" sx={{ color: '#666' }}>
                                        •
                                    </Typography>
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
                                        Back to Login
                                    </Link>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </Box>
                <ToastContainer />
            </>
        );
    }

    // Email input screen (original screen)
    return (
        <>
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
                            Enter your email address and we'll send you a verification code to reset your password.
                        </Typography>

                        <Box component="form" onSubmit={emailFormik.handleSubmit}>
                            <TextField
                                fullWidth
                                margin="dense"
                                autoComplete="off"
                                label="Email Address"
                                name="email"
                                type="email"
                                value={emailFormik.values.email}
                                onChange={emailFormik.handleChange}
                                onBlur={emailFormik.handleBlur}
                                error={emailFormik.touched.email && Boolean(emailFormik.errors.email)}
                                helperText={emailFormik.touched.email && emailFormik.errors.email}
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
                                                color: emailFormik.touched.email && emailFormik.errors.email ? "error.main" : "#667eea"
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
                                disabled={isLoading || emailFormik.isSubmitting}
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
                                {isLoading || emailFormik.isSubmitting ? (
                                    <CircularProgress size={24} sx={{ color: 'white' }} />
                                ) : (
                                    'Verify Email'
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
            <ToastContainer />
        </>
    );
}

export default ForgotPassword;