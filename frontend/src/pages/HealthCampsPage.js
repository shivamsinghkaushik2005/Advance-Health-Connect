import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions,
  Button,
  Box,
  Chip,
  Divider,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  IconButton,
  Paper,
  LinearProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventIcon from '@mui/icons-material/Event';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PeopleIcon from '@mui/icons-material/People';
import { format } from 'date-fns';
import useAuth from '../hooks/useAuth';

// Health Camp Card Component
const HealthCampCard = ({ camp, onRegister }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Calculate percent filled
  const percentFilled = (camp.currentRegistrations / camp.maxParticipants) * 100;
  const remainingSlots = camp.maxParticipants - camp.currentRegistrations;
  
  // Format dates
  const startDate = new Date(camp.startDate);
  const endDate = new Date(camp.endDate);
  const isSameDay = startDate.toDateString() === endDate.toDateString();
  
  const formattedDateRange = isSameDay
    ? format(startDate, 'dd MMM yyyy')
    : `${format(startDate, 'dd MMM')} - ${format(endDate, 'dd MMM yyyy')}`;
  
  const handleRegisterClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    onRegister(camp._id);
  };
  
  return (
    <Card 
      elevation={3} 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.3s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 6
        }
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={camp.image || 'https://source.unsplash.com/random/400x200/?health,medical,hospital'}
        alt={camp.name}
      />
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Box mb={1}>
          <Chip 
            size="small" 
            color="success" 
            label={camp.status.toUpperCase()}
            icon={<EventIcon />}
          />
        </Box>
        
        <Typography gutterBottom variant="h5" component="h2">
          {camp.name}
        </Typography>
        
        <Box display="flex" alignItems="center" mb={1}>
          <LocationOnIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            {camp.location.address}, {camp.location.city}
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="center" mb={1}>
          <EventIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            {formattedDateRange}
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          {camp.description.substring(0, 120)}...
        </Typography>
        
        <Box mt={2}>
          <Typography variant="subtitle2" gutterBottom>
            Specialties:
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={0.5}>
            {camp.specialties.map((specialty, index) => (
              <Chip 
                key={index} 
                label={specialty} 
                size="small" 
                variant="outlined"
                icon={<LocalHospitalIcon fontSize="small" />}
              />
            ))}
          </Box>
        </Box>
        
        <Box mt={2}>
          <Typography variant="subtitle2" gutterBottom>
            Registration:
          </Typography>
          <Box position="relative" pt={0.5}>
            <LinearProgress 
              variant="determinate" 
              value={percentFilled} 
              sx={{ 
                height: 8, 
                borderRadius: 5,
                mb: 1
              }}
            />
            <Box display="flex" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                <PeopleIcon fontSize="inherit" sx={{ verticalAlign: 'text-top' }} />
                {' '}{camp.currentRegistrations} registered
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {remainingSlots} slots left
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
      
      <Divider />
      
      <CardActions sx={{ p: 2 }}>
        <Button 
          size="medium" 
          variant="contained" 
          color="primary" 
          fullWidth
          onClick={handleRegisterClick}
          disabled={camp.currentRegistrations >= camp.maxParticipants || !camp.registrationRequired}
        >
          {camp.registrationRequired 
            ? (camp.currentRegistrations >= camp.maxParticipants 
              ? 'Fully Booked' 
              : 'Register Now')
            : 'No Registration Required'}
        </Button>
      </CardActions>
    </Card>
  );
};

const HealthCampsPage = () => {
  const [camps, setCamps] = useState([]);
  const [filteredCamps, setFilteredCamps] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registerSuccess, setRegisterSuccess] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHealthCamps = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/health-camps');
        setCamps(response.data);
        setFilteredCamps(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load health camps. Please try again later.');
        setLoading(false);
      }
    };

    fetchHealthCamps();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCamps(camps);
      return;
    }
    
    const filtered = camps.filter(camp => 
      camp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camp.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      camp.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    setFilteredCamps(filtered);
  }, [searchQuery, camps]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleRegister = async (campId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      const response = await axios.post(`/api/health-camps/${campId}/register`);
      
      // Update registration count in state
      setCamps(camps.map(camp => 
        camp._id === campId 
          ? { ...camp, currentRegistrations: camp.currentRegistrations + 1 } 
          : camp
      ));
      
      setFilteredCamps(filteredCamps.map(camp => 
        camp._id === campId 
          ? { ...camp, currentRegistrations: camp.currentRegistrations + 1 } 
          : camp
      ));
      
      setRegisterSuccess('You have successfully registered for this health camp');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setRegisterSuccess(null);
      }, 3000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register. Please try again later.');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
        Health Camps
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Find and register for health camps near you. Get free checkups, consultations, and more.
      </Typography>
      
      <Box mb={4}>
        {registerSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>{registerSuccess}</Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}
        
        <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Search by name, specialty, location..."
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Paper>
        
        {filteredCamps.length === 0 && !loading ? (
          <Alert severity="info">
            No health camps found matching your search criteria.
          </Alert>
        ) : (
          <Grid container spacing={4}>
            {filteredCamps.map((camp) => (
              <Grid item key={camp._id} xs={12} sm={6} md={4}>
                <HealthCampCard 
                  camp={camp} 
                  onRegister={handleRegister} 
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default HealthCampsPage; 