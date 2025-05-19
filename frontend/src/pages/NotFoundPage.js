import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Box, Button } from '@mui/material';

const NotFoundPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60vh',
          textAlign: 'center'
        }}
      >
        <Typography variant="h1" color="primary" sx={{ fontSize: '8rem', fontWeight: 'bold', mb: 2 }}>
          404
        </Typography>
        <Typography variant="h4" sx={{ mb: 4 }}>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </Typography>
        <Button variant="contained" color="primary" component={Link} to="/" size="large">
          Go to Homepage
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage; 