import React, { useEffect, useState, useContext } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Grid,
    Avatar,
    Divider,
    MenuItem,
    InputAdornment
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Lock as LockIcon,
    DateRange as DateIcon,
    Public as PublicIcon,
    Language as LanguageIcon,
    AccessTime as TimeIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import UserContext from '../../contexts/UserContext';
import http from '../../http';
import { toast } from 'react-toastify';

function Profile() {
    const { user, setUser } = useContext(UserContext);
    const [editMode, setEditMode] = useState(false);

    const countries = [
        { value: 'singapore', label: 'Singapore' },
        { value: 'malaysia', label: 'Malaysia' },
        { value: 'indonesia', label: 'Indonesia' },
        { value: 'thailand', label: 'Thailand' },
        { value: 'philippines', label: 'Philippines' },
        { value: 'united-states', label: 'United States' },
        { value: 'united-kingdom', label: 'United Kingdom' },
        { value: 'australia', label: 'Australia' },
        { value: 'canada', label: 'Canada' }
    ];

    const languages = [
        { value: 'english', label: 'English' },
        { value: 'chinese', label: 'Chinese' },
        { value: 'malay', label: 'Malay' },
        { value: 'tamil', label: 'Tamil' },
        { value: 'japanese', label: 'Japanese' },
        { value: 'korean', label: 'Korean' },
        { value: 'spanish', label: 'Spanish' },
        { value: 'french', label: 'French' }
    ];

    const timeZones = [
        { value: 'asia/singapore', label: 'Asia/Singapore (SGT)' },
        { value: 'asia/kuala_lumpur', label: 'Asia/Kuala_Lumpur (MYT)' },
        { value: 'asia/jakarta', label: 'Asia/Jakarta (WIB)' },
        { value: 'asia/bangkok', label: 'Asia/Bangkok (ICT)' },
        { value: 'asia/manila', label: 'Asia/Manila (PST)' },
        { value: 'america/new_york', label: 'America/New_York (EST)' },
        { value: 'europe/london', label: 'Europe/London (GMT)' },
        { value: 'australia/sydney', label: 'Australia/Sydney (AEDT)' }
    ];

    const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
            dateOfBirth: "",
            gender: "",
            country: "",
            language: "",
            timeZone: "",
            password: "",
            confirmPassword: ""
        },
        enableReinitialize: true,
        validationSchema: yup.object({
            name: yup.string().trim()
                .min(3, 'Name must be at least 3 characters')
                .max(50, 'Name must be at most 50 characters')
                .required('Name is required'),
            email: yup.string().trim()
                .email('Enter a valid email')
                .max(50, 'Email must be at most 50 characters')
                .required('Email is required'),
            password: yup.string().trim()
                .min(8, 'Password must be at least 8 characters')
                .max(50, 'Password must be at most 50 characters')
                .matches(/^(|(?=.*[a-zA-Z])(?=.*[0-9]).{8,})$/, "Password must have at least 1 letter and 1 number"),
            confirmPassword: yup.string().trim()
                .oneOf([yup.ref('password'), ''], 'Passwords must match')
        }),
        onSubmit: async (data, { setSubmitting, setValues }) => {
            try {
                const payload = {
                    name: data.name.trim(),
                    email: data.email.trim().toLowerCase(),
                    dateOfBirth: data.dateOfBirth,
                    gender: data.gender,
                    country: data.country,
                    language: data.language,
                    timeZone: data.timeZone,
                    password: data.password ? data.password.trim() : undefined
                };

                const response = await http.put('/user/profile', payload);

                toast.success('Profile updated successfully!');
                setEditMode(false);

                // Update token and user context
                if (response.data.accessToken) {
                    localStorage.setItem('accessToken', response.data.accessToken);
                }

                if (response.data.user) {
                    setUser(response.data.user);
                    // Update form values with latest user data, clear password fields
                    setValues({
                        name: response.data.user.name || '',
                        email: response.data.user.email || '',
                        dateOfBirth: response.data.user.dateOfBirth || '',
                        gender: response.data.user.gender || '',
                        country: response.data.user.country || '',
                        language: response.data.user.language || '',
                        timeZone: response.data.user.timeZone || '',
                        password: '',
                        confirmPassword: ''
                    });
                } else {
                    setUser({ ...user, ...payload });
                }
            } catch (err) {
                if (err.response) {
                    const message = err.response.data?.message || `Server error: ${err.response.status}`;
                    toast.error(message);
                } else if (err.request) {
                    toast.error('No response from server. Please check if the server is running.');
                } else {
                    toast.error('An unexpected error occurred');
                }
            } finally {
                setSubmitting(false);
            }
        }
    });

    // Function to reset form values to original user data
    const resetFormValues = () => {
        if (user) {
            formik.setValues({
                name: user.name || '',
                email: user.email || '',
                dateOfBirth: user.dateOfBirth || '',
                gender: user.gender || '',
                country: user.country || '',
                language: user.language || '',
                timeZone: user.timeZone || '',
                password: '',
                confirmPassword: ''
            });
            formik.setTouched({});
            formik.setErrors({});
        }
    };

    // Function to handle cancel action
    const handleCancel = () => {
        resetFormValues();
        setEditMode(false);
    };

    useEffect(() => {
        resetFormValues();
        // eslint-disable-next-line
    }, [user]);

    if (!user) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Typography>Loading...</Typography>
            </Box>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Box
                sx={{
                    width: '100%',
                    backgroundColor: '#E8E3E3',
                    borderRadius: 0,
                    py: 2,
                    mb: 3,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflowX: 'hidden',
                }}
            >
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
                    User Profile
                </Typography>
            </Box>

            <Box sx={{ maxWidth: 1000, mx: 'auto', px: 2 }}>
                {/* Profile Header Card */}
                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Avatar sx={{ width: 80, height: 80, bgcolor: '#4169E1' }}>
                            <PersonIcon sx={{ fontSize: 40 }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                                {user.name || 'User'}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {user.email || 'user@email.com'}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                {/* Profile Form */}
                <Paper elevation={2} sx={{ p: 4 }}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            Personal Information
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {editMode ? "Update your information below" : "View and manage your profile information"}
                        </Typography>
                    </Box>

                    <Box component="form" onSubmit={formik.handleSubmit}>
                        <Grid container spacing={3}>
                            {/* Full Name */}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    name="name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.name && Boolean(formik.errors.name)}
                                    helperText={formik.touched.name && formik.errors.name}
                                    disabled={!editMode}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonIcon color={editMode ? "primary" : "disabled"} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            {/* Date of Birth */}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Date of Birth"
                                    name="dateOfBirth"
                                    type="date"
                                    value={formik.values.dateOfBirth}
                                    onChange={formik.handleChange}
                                    disabled={!editMode}
                                    InputLabelProps={{ shrink: true }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <DateIcon color={editMode ? "primary" : "disabled"} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            {/* Gender */}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Gender"
                                    name="gender"
                                    value={formik.values.gender}
                                    onChange={formik.handleChange}
                                    disabled={!editMode}
                                >
                                    <MenuItem value="">Select Gender</MenuItem>
                                    <MenuItem value="male">Male</MenuItem>
                                    <MenuItem value="female">Female</MenuItem>
                                    <MenuItem value="other">Other</MenuItem>
                                    <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                                </TextField>
                            </Grid>

                            {/* Country */}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Country"
                                    name="country"
                                    value={formik.values.country}
                                    onChange={formik.handleChange}
                                    disabled={!editMode}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PublicIcon color={editMode ? "primary" : "disabled"} />
                                            </InputAdornment>
                                        ),
                                    }}
                                >
                                    <MenuItem value="">Select Country</MenuItem>
                                    {countries.map((country) => (
                                        <MenuItem key={country.value} value={country.value}>
                                            {country.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            {/* Language */}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Language"
                                    name="language"
                                    value={formik.values.language}
                                    onChange={formik.handleChange}
                                    disabled={!editMode}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LanguageIcon color={editMode ? "primary" : "disabled"} />
                                            </InputAdornment>
                                        ),
                                    }}
                                >
                                    <MenuItem value="">Select Language</MenuItem>
                                    {languages.map((language) => (
                                        <MenuItem key={language.value} value={language.value}>
                                            {language.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            {/* Time Zone */}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Time Zone"
                                    name="timeZone"
                                    value={formik.values.timeZone}
                                    onChange={formik.handleChange}
                                    disabled={!editMode}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <TimeIcon color={editMode ? "primary" : "disabled"} />
                                            </InputAdornment>
                                        ),
                                    }}
                                >
                                    <MenuItem value="">Select Time Zone</MenuItem>
                                    {timeZones.map((tz) => (
                                        <MenuItem key={tz.value} value={tz.value}>
                                            {tz.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                        </Grid>

                        {/* Security Section */}
                        <Divider sx={{ my: 4 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                            Account Security
                        </Typography>

                        <Grid container spacing={3}>
                            {/* Email */}
                            <Grid item xs={12} md={6}>
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
                                    disabled={!editMode}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <EmailIcon color={editMode ? "primary" : "disabled"} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            {editMode && (
                                <>
                                    {/* New Password */}
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="New Password (Optional)"
                                            name="password"
                                            type="password"
                                            value={formik.values.password}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            error={formik.touched.password && Boolean(formik.errors.password)}
                                            helperText={formik.touched.password && formik.errors.password}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LockIcon color="primary" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>

                                    {/* Confirm Password */}
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Confirm New Password"
                                            name="confirmPassword"
                                            type="password"
                                            value={formik.values.confirmPassword}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                                            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LockIcon color="primary" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                </>
                            )}
                        </Grid>

                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
                            {!editMode ? (
                                <Button
                                    variant="contained"
                                    size="large"
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setEditMode(true);
                                    }}
                                    sx={{
                                        backgroundColor: '#4169E1',
                                        '&:hover': { backgroundColor: '#365fcf' },
                                        px: 4
                                    }}
                                >
                                    Edit Profile
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        type="submit"
                                        sx={{
                                            backgroundColor: '#4169E1',
                                            '&:hover': { backgroundColor: '#365fcf' },
                                            px: 4
                                        }}
                                    >
                                        Save Changes
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        type="button"
                                        onClick={handleCancel}
                                        sx={{ px: 4 }}
                                    >
                                        Cancel
                                    </Button>
                                </>
                            )}
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
}

export default Profile;