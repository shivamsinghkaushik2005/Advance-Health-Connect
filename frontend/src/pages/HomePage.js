import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Button, Container, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';

const HomePage = () => {
  const { t } = useTranslation();

  return (
    <div>
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

      {/* Features Section - Placeholder */}
      <section className="features-section">
        <Container maxWidth="lg">
          <Typography variant="h2" className="section-title">
            {t('home.ourFeatures')}
          </Typography>
          <Grid container spacing={4} className="features-container">
            {/* Feature cards would go here */}
            <Grid item xs={12} sm={6} md={4}>
              <Box className="feature-card">
                <Typography variant="h5">Video Consultation</Typography>
                <Typography>Connect with doctors virtually</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box className="feature-card">
                <Typography variant="h5">E-Prescriptions</Typography>
                <Typography>Get digital prescriptions instantly</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box className="feature-card">
                <Typography variant="h5">Health Camps</Typography>
                <Typography>Find nearby health camps</Typography>
              </Box>
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