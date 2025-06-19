import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
  Container,
  Typography,
  Grid,
  Box,
  Card,
  CardContent,
  Button,
  Divider,
  Rating,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Paper,
  TextField,
  Tabs,
  Tab,
  Modal,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import CloseIcon from '@mui/icons-material/Close';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PaymentIcon from '@mui/icons-material/Payment';
import LanguageIcon from '@mui/icons-material/Language';
import useAuth from '../hooks/useAuth';
import AppointmentBookingCalendar from '../components/AppointmentBookingCalendar';
import ReviewForm from '../components/ReviewForm';
import DoctorReviews from '../components/DoctorReviews';

// Styled components
const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 140,
  height: 140,
  marginBottom: theme.spacing(2),
  border: `4px solid ${theme.palette.primary.main}`,
}));

const SlotButton = styled(Button)(({ theme, selected }) => ({
  minWidth: '80px',
  margin: '4px',
  backgroundColor: selected ? theme.palette.primary.main : theme.palette.background.paper,
  color: selected ? theme.palette.primary.contrastText : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: selected ? theme.palette.primary.dark : theme.palette.action.hover,
  },
  border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
}));

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`doctor-detail-tabpanel-${index}`}
    aria-labelledby={`doctor-detail-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const DoctorDetailPage = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [appointmentData, setAppointmentData] = useState({
    symptoms: '',
    notes: '',
  });
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [bookingStatus, setBookingStatus] = useState({ success: false, error: null });

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error state
        
        const response = await axios.get(`/api/doctors/${id}`);
        if (!response.data) {
          throw new Error('No data received from server');
        }
        
        setDoctor(response.data);
        
        // Set default day selection if doctor has availability
        if (response.data.availability && response.data.availability.length > 0) {
          setSelectedDay(response.data.availability[0].day);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching doctor details:', err);
        setError(err.response?.data?.message || 'Failed to load doctor details. Please try again later.');
        setLoading(false);
      }
    };

    if (id) {
      fetchDoctor();
    }
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAppointmentData(prev => ({ ...prev, [name]: value }));
  };

  const handleDaySelect = (day) => {
    setSelectedDay(day);
    setSelectedSlot(null); // Reset selected slot when changing day
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleBookAppointment = async () => {
    if (!isAuthenticated || !user) {
      setBookingStatus({ 
        success: false, 
        error: 'Please login to book an appointment' 
      });
      setTimeout(() => {
        navigate('/login', { state: { from: location.pathname } });
      }, 1500);
      return;
    }

    if (user.userType !== 'patient') {
      setBookingStatus({ 
        success: false, 
        error: 'Only patients can book appointments' 
      });
      return;
    }

    if (!selectedDay || !selectedSlot) {
      setBookingStatus({ success: false, error: 'Please select a day and time slot for your appointment.' });
      return;
    }

    if (!appointmentData.symptoms.trim()) {
      setBookingStatus({ success: false, error: 'Please describe your symptoms.' });
      return;
    }

    // Format the appointment date
    const today = new Date();
    const dayMap = {
      Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 0
    };
    
    const daysDiff = (7 + dayMap[selectedDay] - today.getDay()) % 7;
    const appointmentDate = new Date(today);
    appointmentDate.setDate(today.getDate() + (daysDiff === 0 ? 7 : daysDiff)); // Next occurrence of the day
    
    try {
      setBookingStatus({ success: false, error: null }); // Reset status
      
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.post('/api/appointments', 
        {
          doctorId: doctor._id,
          appointmentDate: appointmentDate.toISOString(),
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          symptoms: appointmentData.symptoms,
          notes: appointmentData.notes
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Appointment booked successfully:', response.data);
      setBookingStatus({ success: true, error: null });
      setPaymentModalOpen(true);
    } catch (err) {
      console.error('Error booking appointment:', err);
      const errorMessage = err.response?.data?.message || 'Failed to book appointment. Please try again.';
      if (err.response?.status === 401 || err.response?.status === 403) {
        // If unauthorized or forbidden, redirect to login
        setTimeout(() => {
          navigate('/login', { state: { from: location.pathname } });
        }, 1500);
      }
      setBookingStatus({ 
        success: false, 
        error: errorMessage
      });
    }
  };

  const handlePaymentComplete = () => {
    setPaymentModalOpen(false);
    navigate('/appointments');
  };

  const getAvailableSlots = () => {
    if (!selectedDay || !doctor) return [];
    
    const daySchedule = doctor.availability.find(day => day.day === selectedDay);
    return daySchedule ? daySchedule.slots : [];
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!doctor) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">Doctor not found</Alert>
      </Container>
    );
  }

  const availableSlots = getAvailableSlots();

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Grid container spacing={4}>
        {/* Doctor Profile Section */}
        <Grid item xs={12} md={4}>
          <Card elevation={4}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <StyledAvatar 
                src={doctor.image ? doctor.image : `https://randomuser.me/api/portraits/${doctor.userId.gender === 'female' ? 'women' : 'men'}/${Math.floor(Math.random() * 70)}.jpg`}
                alt={doctor.userId.name} 
              />
              
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {doctor.userId.name}
              </Typography>
              
              <Typography variant="subtitle1" color="primary" gutterBottom>
                {doctor.speciality}
              </Typography>
              
              <Box display="flex" justifyContent="center" alignItems="center" mb={1}>
                <Rating value={doctor.rating || 0} precision={0.1} readOnly size="small" />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  ({doctor.reviewCount || 0} {t('common.reviews')})
                </Typography>
              </Box>
              
              <Box my={2}>
                <Chip
                  icon={<LocalHospitalIcon />}
                  color="success"
                  label={doctor.isVerified ? 'Verified Doctor' : 'Verification Pending'}
                  variant="outlined"
                />
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="body1">Consultation Fee:</Typography>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  ₹{doctor.fees}
                </Typography>
              </Box>
              
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Languages:
                </Typography>
                <Box display="flex" flexWrap="wrap" justifyContent="center" gap={0.5}>
                  {doctor.languages.map((language) => (
                    <Chip 
                      key={language} 
                      label={language} 
                      size="small" 
                      icon={<LanguageIcon fontSize="small" />}
                    />
                  ))}
                </Box>
              </Box>
              
              <Box mt={3}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                  size="large"
                  onClick={() => setTabValue(1)} // Switch to appointments tab
                >
                  Book Appointment
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Doctor Details Section */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
                textColor="primary"
                indicatorColor="primary"
              >
                <Tab label="Profile" />
                <Tab label="Book Appointment" />
                <Tab label="Reviews" />
              </Tabs>
            </Box>
            
            {/* Profile Tab */}
            <TabPanel value={tabValue} index={0}>
              <Box p={2}>
                <Typography variant="h6" color="primary" gutterBottom>
                  About
                </Typography>
                <Typography variant="body1" paragraph>
                  {doctor.userId.name} is a specialized {doctor.speciality} with extensive experience in the field. 
                  Providing quality healthcare services to patients from Muzaffarpur, Bihar and surrounding areas.
                </Typography>
                
                <Typography variant="h6" color="primary" gutterBottom>
                  Education
                </Typography>
                <List dense>
                  {doctor.education && doctor.education.length > 0 ? (
                    doctor.education.map((edu, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <SchoolIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={`${edu.degree} - ${edu.institution}`} 
                          secondary={`${edu.year}`} 
                        />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText primary="No education details available" />
                    </ListItem>
                  )}
                </List>
                
                <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 3 }}>
                  Experience
                </Typography>
                <List dense>
                  {doctor.experience && doctor.experience.length > 0 ? (
                    doctor.experience.map((exp, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <WorkIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={`${exp.position} - ${exp.hospital}`} 
                          secondary={`${exp.duration}`} 
                        />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText primary="No experience details available" />
                    </ListItem>
                  )}
                </List>
                
                <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 3 }}>
                  Available Days
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {doctor.availability && doctor.availability.length > 0 ? (
                    doctor.availability.map((day) => (
                      <Chip
                        key={day.day}
                        label={day.day}
                        color="primary"
                        variant="outlined"
                        icon={<EventIcon />}
                      />
                    ))
                  ) : (
                    <Typography variant="body2">No availability information</Typography>
                  )}
                </Box>

                <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 3 }}>
                  License Information
                </Typography>
                <Typography variant="body1" paragraph>
                  License Number: {doctor.licenseNumber || 'Not available'}
                </Typography>
              </Box>
            </TabPanel>
            
            {/* Book Appointment Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box p={2}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Book Your Appointment
                </Typography>
                
                {bookingStatus.error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {bookingStatus.error}
                  </Alert>
                )}
                
                {bookingStatus.success && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    Appointment booked successfully! Please proceed to payment.
                  </Alert>
                )}
                
                <Typography variant="body1" paragraph>
                  Select an available time slot (green) on the calendar below to book your appointment with Dr. {doctor.userId.name}.
                </Typography>
                
                <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1">Consultation Fee:</Typography>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      ₹{doctor.fees}
                    </Typography>
                  </Box>
                </Paper>
                
                {/* Calendar Component */}
                <AppointmentBookingCalendar 
                  doctorId={doctor._id} 
                  doctorName={doctor.userId.name}
                  doctorFees={doctor.fees}
                />
              </Box>
            </TabPanel>
            
            {/* Reviews Tab */}
            <TabPanel value={tabValue} index={2}>
              <Box p={2}>
                <Box display="flex" alignItems="center" mb={3}>
                  <Rating value={doctor.rating || 0} precision={0.1} readOnly />
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {(doctor.rating || 0).toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    ({doctor.numberOfReviews || 0} {t('common.reviews')})
                  </Typography>
                </Box>
                
                {/* Review Form for logged-in patients */}
                {isAuthenticated && user && user.userType === 'patient' && (
                  <ReviewForm 
                    doctorId={doctor._id} 
                    appointmentId={null} // This will be set when coming from appointments page
                    onReviewSubmitted={() => {
                      // Refresh doctor data to update rating
                      const fetchDoctor = async () => {
                        try {
                          const response = await axios.get(`/api/doctors/${id}`);
                          setDoctor(response.data);
                        } catch (err) {
                          console.error('Error refreshing doctor details:', err);
                        }
                      };
                      fetchDoctor();
                    }}
                  />
                )}
                
                {/* Display Reviews */}
                <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                  {t('doctors.reviews')}
                </Typography>
                <DoctorReviews doctorId={doctor._id} />
              </Box>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Payment Modal */}
      <Modal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        aria-labelledby="payment-modal-title"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 500 },
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2
        }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography id="payment-modal-title" variant="h6" component="h2">
              Complete Payment
            </Typography>
            <IconButton onClick={() => setPaymentModalOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Appointment Details:
            </Typography>
            <Typography variant="body2">
              Doctor: {doctor.userId.name}
            </Typography>
            <Typography variant="body2">
              Speciality: {doctor.speciality}
            </Typography>
            <Typography variant="body2">
              Day: {selectedDay}
            </Typography>
            <Typography variant="body2">
              Time: {selectedSlot?.startTime} - {selectedSlot?.endTime}
            </Typography>
          </Box>
          
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Payment Amount:
            </Typography>
            <Typography variant="h5" color="primary" fontWeight="bold">
              ₹{doctor.fees}
            </Typography>
          </Box>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            This is a demo payment page. In a real application, payment gateway would be integrated here.
          </Alert>
          
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            startIcon={<PaymentIcon />}
            onClick={handlePaymentComplete}
          >
            Complete Payment
          </Button>
        </Box>
      </Modal>
    </Container>
  );
};

export default DoctorDetailPage;