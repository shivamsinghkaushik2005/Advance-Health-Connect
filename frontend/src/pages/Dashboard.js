import React from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Typography, Box, Grid, Paper } from '@mui/material';
import useAuth from '../hooks/useAuth';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold">
          {t('nav.dashboard')}
        </Typography>
        <Typography variant="body1" color="text.secondary" mt={1}>
          {user ? `Welcome back, ${user.name}` : 'Welcome to your dashboard'}
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" gutterBottom>
              Upcoming Appointments
            </Typography>
            <Box 
              sx={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center'
              }}
            >
              <Typography variant="h3" color="primary">
                0
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" gutterBottom>
              Prescriptions
            </Typography>
            <Box 
              sx={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center'
              }}
            >
              <Typography variant="h3" color="primary">
                0
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" gutterBottom>
              Health Camps
            </Typography>
            <Box 
              sx={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center'
              }}
            >
              <Typography variant="h3" color="primary">
                0
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        {/* Main Content */}
        <Grid item xs={12}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3,
              minHeight: '300px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 2
            }}
          >
            <Typography variant="h5" color="text.secondary">
              Dashboard content coming soon
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 