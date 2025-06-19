import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Snackbar,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  LocalHospital,
  MyLocation,
  Send,
  Phone,
  Close,
  Notifications,
  DirectionsCar,
  Warning
} from '@mui/icons-material';
import axios from 'axios';

const EmergencySOS = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([
    { name: 'Emergency Contact 1', phone: '123-456-7890' },
    { name: 'Emergency Contact 2', phone: '098-765-4321' }
  ]);
  const [alertSent, setAlertSent] = useState(false);

  // Get user's current location
  const getUserLocation = () => {
    setLoading(true);
    setError(null);
    
    // Always open the dialog, even if location fails
    const showEmergencyDialog = () => {
      // Use default location if actual location is not available
      const defaultLocation = { lat: 40.7128, lng: -74.0060 }; // Default NYC coordinates
      
      // If no location is set, use the default
      if (!location) {
        setLocation(defaultLocation);
      }
      
      // Find nearby hospitals with whatever location we have
      findNearbyHospitals(location || defaultLocation);
      setOpenDialog(true);
      setLoading(false);
    };

    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,
        timeout: 5000,         // Reduced timeout to 5 seconds
        maximumAge: 0          // Don't use cached position
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(userLocation);
          showEmergencyDialog();
        },
        (error) => {
          console.error('Error getting location:', error);
          let errorMessage = 'Unable to get your location. ';
          
          // Provide more specific error messages
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Location permission was denied. Using default location instead.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information is unavailable. Using default location instead.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out. Using default location instead.';
              break;
            default:
              errorMessage += 'Using default location instead.';
          }
          
          setError(errorMessage);
          // Still show dialog with default location
          showEmergencyDialog();
        },
        options
      );
    } else {
      setError('Geolocation is not supported by this browser. Using default location instead.');
      showEmergencyDialog();
    }
  };

  // Find nearby hospitals (mock data for now)
  const findNearbyHospitals = (userLocation) => {
    // In a real app, this would call a Maps API to find actual nearby hospitals
    // For now, we'll use mock data
    const mockHospitals = [
      {
        id: 1,
        name: 'City General Hospital',
        address: '123 Medical Ave, City',
        distance: '0.8 km',
        phone: '555-123-4567',
        emergency: true
      },
      {
        id: 2,
        name: 'Community Health Center',
        address: '456 Health St, City',
        distance: '1.2 km',
        phone: '555-987-6543',
        emergency: true
      },
      {
        id: 3,
        name: 'University Medical Center',
        address: '789 University Blvd, City',
        distance: '2.5 km',
        phone: '555-456-7890',
        emergency: true
      }
    ];

    setNearbyHospitals(mockHospitals);
  };

  // Send emergency alert to contacts
  const sendEmergencyAlert = () => {
    setLoading(true);
    
    // In a real app, this would send SMS/notifications to emergency contacts
    // For now, we'll simulate it with a timeout
    setTimeout(() => {
      setAlertSent(true);
      setSuccess('Emergency alert sent to your contacts!');
      setLoading(false);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    }, 2000);
  };

  // Call emergency number
  const callEmergency = (phoneNumber) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  // Get directions to hospital
  const getDirections = (hospital) => {
    if (location) {
      // In a real app, this would open maps with directions
      // For now, we'll just open Google Maps in a new tab
      const url = `https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${hospital.address}&travelmode=driving`;
      window.open(url, '_blank');
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Main SOS Button */}
      <Button
        variant="contained"
        color="error"
        size="large"
        startIcon={<Warning />}
        onClick={getUserLocation}
        sx={{
          borderRadius: '50px',
          padding: '12px 24px',
          fontWeight: 'bold',
          boxShadow: '0 4px 8px rgba(255, 0, 0, 0.3)',
          '&:hover': {
            backgroundColor: '#d32f2f',
            boxShadow: '0 6px 12px rgba(255, 0, 0, 0.4)'
          },
          animation: alertSent ? 'none' : 'pulse 2s infinite'
        }}
      >
        Emergency Help
      </Button>

      {/* Loading indicator */}
      {loading && (
        <CircularProgress
          size={24}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: '-12px',
            marginLeft: '-12px'
          }}
        />
      )}

      {/* Emergency Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#f44336', color: 'white' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <LocalHospital sx={{ mr: 1 }} />
              Emergency Assistance
            </Box>
            <IconButton onClick={() => setOpenDialog(false)} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {/* User Location */}
          {location && (
            <Box sx={{ mb: 2, mt: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                <MyLocation sx={{ mr: 1, verticalAlign: 'middle' }} />
                Your Location
              </Typography>
              <Typography variant="body2">
                Latitude: {location.lat.toFixed(6)}, Longitude: {location.lng.toFixed(6)}
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />
          
          {/* Nearby Hospitals */}
          <Typography variant="subtitle1" fontWeight="bold">
            <LocalHospital sx={{ mr: 1, verticalAlign: 'middle' }} />
            Nearby Hospitals
          </Typography>
          
          <List>
            {nearbyHospitals.map((hospital) => (
              <Paper key={hospital.id} elevation={2} sx={{ mb: 2, p: 1 }}>
                <ListItem
                  secondaryAction={
                    <Box>
                      <Tooltip title="Call">
                        <IconButton edge="end" onClick={() => callEmergency(hospital.phone)}>
                          <Phone color="primary" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Get Directions">
                        <IconButton edge="end" onClick={() => getDirections(hospital)}>
                          <DirectionsCar color="primary" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: hospital.emergency ? '#f44336' : '#2196f3' }}>
                      <LocalHospital />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight="bold">
                        {hospital.name}
                        {hospital.emergency && (
                          <Typography
                            component="span"
                            variant="caption"
                            sx={{ ml: 1, bgcolor: '#f44336', color: 'white', p: 0.5, borderRadius: 1 }}
                          >
                            24/7 Emergency
                          </Typography>
                        )}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2">{hospital.address}</Typography>
                        <Typography variant="body2">
                          Distance: {hospital.distance} | Phone: {hospital.phone}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              </Paper>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />
          
          {/* Emergency Contacts */}
          <Typography variant="subtitle1" fontWeight="bold">
            <Notifications sx={{ mr: 1, verticalAlign: 'middle' }} />
            Alert Emergency Contacts
          </Typography>
          
          <List>
            {emergencyContacts.map((contact, index) => (
              <ListItem key={index}>
                <ListItemAvatar>
                  <Avatar>
                    <Phone />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={contact.name}
                  secondary={contact.phone}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button
            onClick={() => setOpenDialog(false)}
            variant="outlined"
            color="inherit"
          >
            Close
          </Button>
          <Button
            onClick={sendEmergencyAlert}
            variant="contained"
            color="error"
            startIcon={<Send />}
            disabled={alertSent}
          >
            {alertSent ? 'Alert Sent' : 'Send Emergency Alert'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={!!success || !!error}
        autoHideDuration={6000}
        onClose={() => {
          setSuccess(null);
          setError(null);
        }}
      >
        <Alert
          severity={success ? 'success' : 'error'}
          variant="filled"
          onClose={() => {
            setSuccess(null);
            setError(null);
          }}
        >
          {success || error}
        </Alert>
      </Snackbar>

      {/* CSS for pulse animation */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7);
          }
          70% {
            box-shadow: 0 0 0 15px rgba(255, 0, 0, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 0, 0, 0);
          }
        }
      `}</style>
    </Box>
  );
};

export default EmergencySOS;