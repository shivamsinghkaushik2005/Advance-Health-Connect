import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import useAuth from '../hooks/useAuth';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Clear form data when component mounts
  useEffect(() => {
    setFormData({
      email: '',
      password: '',
    });
    setError('');
    
    // Check if user is already authenticated
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user starts typing again
    if (error) setError('');
  };
  
  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Password length validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Attempting login...');
      
      // Trim email to prevent whitespace issues
      const trimmedEmail = formData.email.trim();
      
      // Login the user
      const response = await login(trimmedEmail, formData.password);
      console.log('Login successful:', response);
      
      // Redirect based on user type
      if (response.user.userType === 'doctor') {
        console.log('User is a doctor, redirecting to doctor dashboard');
        navigate('/doctor-dashboard');
      } else {
        console.log('User is not a doctor, redirecting to regular dashboard');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // More detailed error handling
      if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Invalid credentials');
      } else if (err.response?.status === 401) {
        setError('Invalid credentials. Please check your email and password.');
      } else if (err.response?.status === 404) {
        setError('User not found. Please check your email or register a new account.');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
      
      // Clear password field on error
      setFormData({
        ...formData,
        password: ''
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            {t('auth.loginTitle')}
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label={t('auth.email')}
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            margin="normal"
            autoComplete="email"
            error={!!error}
            disabled={loading}
            inputProps={{
              autoCapitalize: 'none',
              autoCorrect: 'off'
            }}
          />
          
          <TextField
            fullWidth
            label={t('auth.password')}
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            margin="normal"
            autoComplete="current-password"
            error={!!error}
            disabled={loading}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              t('auth.loginButton')
            )}
          </Button>
        </form>
        
        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>
        
        <Grid container justifyContent="center">
          <Grid item>
            <Typography variant="body2">
              {t('auth.noAccount')}{' '}
              <Link to="/register" style={{ color: 'primary' }}>
                {t('auth.registerHere')}
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default LoginPage;