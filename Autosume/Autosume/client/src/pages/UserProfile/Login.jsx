// Frontend - Login.jsx (React Component)
import React, { useContext, useState } from 'react';
import { Box, Typography, TextField, Button, Link, IconButton, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../../http';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserContext from '../../contexts/UserContext';
import { Visibility, VisibilityOff } from '@mui/icons-material';

function Login() {
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);

    const [showPassword, setShowPassword] = useState(false);

    const formik = useFormik({
        initialValues: {
            email: "",
            password: ""
        },
        validationSchema: yup.object({
            email: yup.string().trim()
                .email('Enter a valid email')
                .max(50, 'Email must be at most 50 characters')
                .required('Email is required'),
            password: yup.string().trim()
                .min(8, 'Password must be at least 8 characters')
                .max(50, 'Password must be at most 50 characters')
                .required('Password is required')
        }),
        onSubmit: async (data, { setSubmitting }) => {
            try {
                data.email = data.email.trim().toLowerCase();
                data.password = data.password.trim();

                const response = await http.post("/user/login", data);

                // Store token and user data
                localStorage.setItem("accessToken", response.data.accessToken);
                if (response.data.refreshToken) {
                    localStorage.setItem("refreshToken", response.data.refreshToken);
                }

                setUser(response.data.user);
                toast.success("Login successful!");

                // Navigate based on user role or default to profile
                const redirectPath = response.data.user.role === 'admin' ? '/admin' : '/profile';
                navigate(redirectPath);

            } catch (err) {
                console.error('Login error:', err);
                toast.error(`${err.response?.data?.message || "Login failed"}`);
            } finally {
                setSubmitting(false);
            }
        }
    });

    const handleForgotPassword = () => {
        navigate('/ForgotPassword');
    };

    return (
        <>
            <Box
                sx={{
                    width: '100vw',
                    backgroundColor: '#E8E3E3',
                    borderRadius: 0,
                    py: 2,
                    mb: 3,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    left: '50%',
                    right: '50%',
                    marginLeft: '-50vw',
                    marginRight: '-50vw',
                }}
            >
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
                    Login
                </Typography>
            </Box>
            <Box sx={{
                marginTop: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 2 }}>
                    WELCOME BACK
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    LOG IN TO CONTINUE
                </Typography>
                <Box component="form" sx={{ maxWidth: '500px', width: '100%' }}
                    onSubmit={formik.handleSubmit}>
                    <TextField
                        fullWidth margin="dense" autoComplete="off"
                        label="Email"
                        name="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                    />
                    <TextField
                        fullWidth margin="dense" autoComplete="off"
                        label="Password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                        aria-label="toggle password visibility"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />


                    {/* Forgot Password Link */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 2 }}>
                        <Link
                            component="button"
                            type="button"
                            onClick={handleForgotPassword}
                            sx={{
                                color: '#4169E1',
                                textDecoration: 'none',
                                fontSize: '0.875rem',
                                '&:hover': {
                                    textDecoration: 'underline'
                                }
                            }}
                        >
                            Forgot Password?
                        </Link>
                    </Box>

                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 1, backgroundColor: '#4169E1', '&:hover': { backgroundColor: '#365fcf' } }}
                        type="submit"
                        disabled={formik.isSubmitting}
                    >
                        {formik.isSubmitting ? 'LOGGING IN...' : 'LOGIN'}
                    </Button>
                </Box>

                {/* Additional helpful links */}
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Don't have an account?{' '}
                        <Link
                            component="button"
                            type="button"
                            onClick={() => navigate('/register')}
                            sx={{
                                color: '#4169E1',
                                textDecoration: 'none',
                                '&:hover': {
                                    textDecoration: 'underline'
                                }
                            }}
                        >
                            Sign up here
                        </Link>
                    </Typography>
                </Box>

                <ToastContainer />
            </Box>
        </>
    );
}

export default Login;