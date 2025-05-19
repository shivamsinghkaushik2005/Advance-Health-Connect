import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  Button,
  TextField,
  Alert,
  Snackbar,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  VerifiedUser as VerifiedUserIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import useAuth from '../hooks/useAuth';
import axios from 'axios';

const ProfilePage = () => {
  const { t } = useTranslation();
  const { user, setUser } = useAuth();
  
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    gender: user?.gender || ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Start editing profile
  const handleEditClick = () => {
    setEditing(true);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      gender: user?.gender || ''
    });
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setEditing(false);
    setErrorMessage('');
  };
  
  // Save profile changes
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.put('/api/auth/profile', formData);
      
      if (response.data) {
        setUser(response.data);
        setEditing(false);
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || 
        'Failed to update profile. Please try again.'
      );
    }
  };
  
  // Generate avatar initials from user name
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  // Get user type display name
  const getUserTypeDisplay = (type) => {
    const types = {
      patient: 'Patient',
      doctor: 'Doctor',
      admin: 'Administrator'
    };
    return types[type] || type;
  };
  
  // Get color based on user type
  const getUserTypeColor = (type) => {
    const colors = {
      patient: 'primary',
      doctor: 'success',
      admin: 'error'
    };
    return colors[type] || 'default';
  };
  
  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info">
          You need to be logged in to view your profile.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">
          {t('profile.title')}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          View and manage your personal information
        </Typography>
      </Box>
      
      {/* Success and Error Messages */}
      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={6000} 
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      </Snackbar>
      
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}
      
      <Grid container spacing={4}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  margin: '0 auto 16px',
                  bgcolor: getUserTypeColor(user.userType),
                  fontSize: '2.5rem',
                  fontWeight: 'bold'
                }}
                src={user.profileImage}
              >
                {getInitials(user.name)}
              </Avatar>
              
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {user.name}
              </Typography>
              
              <Chip
                icon={<BadgeIcon />}
                label={getUserTypeDisplay(user.userType)}
                color={getUserTypeColor(user.userType)}
                variant="outlined"
                sx={{ mt: 1 }}
              />
              
              <Divider sx={{ my: 3 }} />
              
              {!editing && (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleEditClick}
                  fullWidth
                >
                  Edit Profile
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Details Section */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            {!editing ? (
              /* Profile Details View */
              <>
                <Typography variant="h5" gutterBottom>
                  Personal Information
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Full Name"
                      secondary={user.name}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email Address"
                      secondary={user.email}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Phone Number"
                      secondary={user.phoneNumber || 'Not provided'}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <BadgeIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Account Type"
                      secondary={getUserTypeDisplay(user.userType)}
                    />
                  </ListItem>
                  
                  {user.gender && (
                    <ListItem>
                      <ListItemIcon>
                        <PersonIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Gender"
                        secondary={user.gender}
                      />
                    </ListItem>
                  )}
                  
                  <ListItem>
                    <ListItemIcon>
                      <VerifiedUserIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Account Status"
                      secondary="Active"
                    />
                  </ListItem>
                </List>
              </>
            ) : (
              /* Edit Profile Form */
              <form onSubmit={handleSubmit}>
                <Typography variant="h5" gutterBottom>
                  Edit Profile
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      type="email"
                      required
                      disabled
                      helperText="Email cannot be changed"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      select
                      SelectProps={{ native: true }}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                      >
                        Save Changes
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage; 