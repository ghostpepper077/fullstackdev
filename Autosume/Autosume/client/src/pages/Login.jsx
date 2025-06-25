import React, { useContext } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../http';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserContext from '../contexts/UserContext';

function Login() {
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);

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
        onSubmit: (data) => {
            data.email = data.email.trim().toLowerCase();
            data.password = data.password.trim();
            http.post("/user/login", data)
                .then((res) => {
                    localStorage.setItem("accessToken", res.data.accessToken);
                    setUser(res.data.user);
                    navigate("/");
                })
                .catch(function (err) {
                    toast.error(`${err.response?.data?.message || "Login failed"}`);
                });
        }
    });

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
                <Box component="form" sx={{ maxWidth: '500px' }}
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
                        name="password" type="password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 2, backgroundColor: '#4169E1', '&:hover': { backgroundColor: '#365fcf' } }}
                        type="submit"
                    >
                        LOGIN
                    </Button>
                </Box>
                <ToastContainer />
            </Box>
        </>
    );
}

export default Login;