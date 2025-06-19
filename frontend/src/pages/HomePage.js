import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Button, Container, Grid, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import EmergencySOS from '../components/EmergencySOS';
import '../styles/HomePage.css';

const HomePage = () => {
  const { t } = useTranslation();

  return (
    <div>
      {/* Emergency SOS Button - Fixed Position */}
      <Box
        sx={{
          position: 'fixed',
          bottom: '90px', // Increased bottom position to avoid overlap with chatbot
          right: '30px',
          zIndex: 999, // Set z-index lower than chatbot to ensure proper layering
        }}
      >
        <EmergencySOS />
      </Box>

      {/* Hero Section */}
      <section className="hero-section">
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6} className="hero-content">
              <Typography variant="h1" className="hero-title">
                {t('home.welcome')}
              </Typography>
              <Typography variant="h5" className="hero-subtitle">
                {t('home.heroSubtitle')}
              </Typography>
              <div className="hero-buttons">
                <Button 
                  component={Link} 
                  to="/register" 
                  variant="contained" 
                  color="primary" 
                  size="large"
                >
                  {t('home.getStarted')}
                </Button>
                <Button 
                  component={Link} 
                  to="/doctors" 
                  variant="outlined" 
                  color="primary" 
                  size="large"
                >
                  {t('home.findDoctors')}
                </Button>
              </div>
            </Grid>
            <Grid item xs={12} md={6} className="hero-image">
              <img 
                src="https://img.freepik.com/free-vector/online-doctor-consultation-illustration_88138-414.jpg" 
                alt="Health Connect" 
              />
            </Grid>
          </Grid>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <Container maxWidth="lg">
          <Typography variant="h2" className="section-title">
            {t('home.ourFeatures')}
          </Typography>
          <Grid container spacing={4} className="features-container">
            {/* Emergency SOS Feature Card */}
            <Grid item xs={12} sm={6} md={4}>
              <Paper 
                elevation={3} 
                className="feature-card" 
                sx={{ 
                  p: 3, 
                  border: '2px solid #f44336',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '5px',
                    backgroundColor: '#f44336',
                  }
                }}
              >
                <Typography variant="h5" color="error" fontWeight="bold">
                  Emergency SOS
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  One-click emergency assistance with location tracking and nearby hospital finder
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      bgcolor: '#ffebee', 
                      color: '#d32f2f', 
                      px: 1, 
                      py: 0.5, 
                      borderRadius: 1,
                      display: 'inline-block'
                    }}
                  >
                    Location Tracking
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      bgcolor: '#ffebee', 
                      color: '#d32f2f', 
                      px: 1, 
                      py: 0.5, 
                      borderRadius: 1,
                      display: 'inline-block'
                    }}
                  >
                    Nearby Hospitals
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      bgcolor: '#ffebee', 
                      color: '#d32f2f', 
                      px: 1, 
                      py: 0.5, 
                      borderRadius: 1,
                      display: 'inline-block'
                    }}
                  >
                    Emergency Contacts
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={2} className="feature-card" sx={{ p: 3 }}>
                <Typography variant="h5">Video Consultation</Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>Connect with doctors virtually from the comfort of your home</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={2} className="feature-card" sx={{ p: 3 }}>
                <Typography variant="h5">E-Prescriptions</Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>Get digital prescriptions instantly after your consultation</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={2} className="feature-card" sx={{ p: 3 }}>
                <Typography variant="h5">Health Camps</Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>Find and register for nearby health camps and medical events</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <Container maxWidth="lg">
          <Typography variant="h3" className="cta-title">
            Ready to take control of your health?
          </Typography>
          <Typography variant="h6" className="cta-subtitle">
            Join thousands of users who manage their healthcare needs with Health Connect
          </Typography>
          <Button 
            component={Link} 
            to="/register" 
            variant="contained" 
            color="secondary" 
            size="large"
          >
            {t('home.signupNow')}
          </Button>
        </Container>
      </section>
    </div>
  );
};

export default HomePage;