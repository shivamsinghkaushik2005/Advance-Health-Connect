import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, Fade } from '@mui/material';
import { Lightbulb } from '@mui/icons-material';
import '../styles/health-tips.css';

const HealthTips = () => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  // Hardcoded array of health tips
  const healthTips = [
    'Drink at least 2 liters of water daily for proper hydration.',
    'Aim for 7-8 hours of quality sleep every night.',
    'Include 5 servings of fruits and vegetables in your daily diet.',
    'Take a 5-minute break for every hour of screen time.',
    'Practice deep breathing for 5 minutes daily to reduce stress.',
    'Walk at least 10,000 steps daily for cardiovascular health.',
    'Limit caffeine intake after 2 PM for better sleep quality.',
    'Maintain good posture while sitting to prevent back pain.',
    'Wash your hands frequently to prevent infections.',
    'Schedule regular health check-ups even when you feel healthy.'
  ];

  // Function to rotate tips with fade effect
  useEffect(() => {
    const interval = setInterval(() => {
      // Start fade out
      setFadeIn(false);
      
      // Change tip after fade out
      setTimeout(() => {
        setCurrentTipIndex((prevIndex) => (prevIndex + 1) % healthTips.length);
        // Start fade in
        setFadeIn(true);
      }, 500); // Half a second for fade out
    }, 8000); // Change tip every 8 seconds

    return () => clearInterval(interval);
  }, [healthTips.length]);

  return (
    <Fade in={fadeIn} timeout={500}>
      <Paper 
        elevation={3} 
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          borderRadius: 2,
          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          border: '1px solid #90caf9',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '5px',
            backgroundColor: '#2196f3',
          }
        }}
      >
        <Box sx={{ mr: 2, color: '#1976d2' }} className="health-tip-icon">
          <Lightbulb fontSize="large" />
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" color="primary">
            Today's Health Tip:
          </Typography>
          <Typography variant="body1">
            {healthTips[currentTipIndex]}
          </Typography>
        </Box>
      </Paper>
    </Fade>
  );
};

export default HealthTips;