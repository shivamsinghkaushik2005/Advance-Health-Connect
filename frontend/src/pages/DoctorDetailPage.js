import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
        const response = await axios.get(`/api/doctors/${id}`);
        setDoctor(response.data);
        
        // Set default day selection if doctor has availability
        if (response.data.availability && response.data.availability.length > 0) {
          setSelectedDay(response.data.availability[0].day);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load doctor details. Please try again later.');
        setLoading(false);
      }
    };

    fetchDoctor();
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
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      setBookingStatus({ 
        success: false, 
        error: 'Please login to book an appointment' 
      });
      // Navigate to login page after a brief delay
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    if (!selectedDay || !selectedSlot) {
      setBookingStatus({ success: false, error: 'Please select a day and time slot for your appointment.' });
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
      const response = await axios.post('/api/appointments', {
        doctorId: doctor._id,
        appointmentDate: appointmentDate.toISOString(),
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        symptoms: appointmentData.symptoms,
        notes: appointmentData.notes,
        paymentAmount: doctor.fees,
        paymentStatus: 'pending'
      });
      
      setBookingStatus({ success: true, error: null });
      setPaymentModalOpen(true);
    } catch (err) {
      setBookingStatus({ 
        success: false, 
        error: err.response?.data?.message || 'Failed to book appointment. Please try again.' 
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
                <Rating value={doctor.rating} precision={0.1} readOnly size="small" />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  ({doctor.reviewCount} {t('common.reviews')})
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
                  Select Date & Time
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
                
                <Typography variant="subtitle2" gutterBottom>
                  Step 1: Select Day
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
                  {doctor.availability.map((day) => (
                    <Chip
                      key={day.day}
                      label={day.day}
                      color={selectedDay === day.day ? "primary" : "default"}
                      variant={selectedDay === day.day ? "filled" : "outlined"}
                      onClick={() => handleDaySelect(day.day)}
                      clickable
                    />
                  ))}
                </Box>
                
                <Typography variant="subtitle2" gutterBottom>
                  Step 2: Select Time Slot
                </Typography>
                {selectedDay ? (
                  <Box display="flex" flexWrap="wrap" mb={3}>
                    {availableSlots.map((slot, index) => (
                      <SlotButton
                        key={index}
                        variant={selectedSlot === slot ? "contained" : "outlined"}
                        selected={selectedSlot === slot}
                        onClick={() => handleSlotSelect(slot)}
                        disabled={slot.isBooked}
                        startIcon={<AccessTimeIcon />}
                      >
                        {slot.startTime}
                      </SlotButton>
                    ))}
                    {availableSlots.length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        No available slots for this day.
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Please select a day first.
                  </Typography>
                )}
                
                <Typography variant="subtitle2" gutterBottom>
                  Step 3: Appointment Details
                </Typography>
                <Grid container spacing={2} mb={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Symptoms/Reason for Visit"
                      multiline
                      rows={3}
                      name="symptoms"
                      value={appointmentData.symptoms}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Additional Notes (Optional)"
                      multiline
                      rows={2}
                      name="notes"
                      value={appointmentData.notes}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </Grid>
                
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle1">Consultation Fee:</Typography>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    ₹{doctor.fees}
                  </Typography>
                </Box>
                
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={!selectedDay || !selectedSlot || bookingStatus.success}
                  onClick={handleBookAppointment}
                >
                  {bookingStatus.success ? "Appointment Booked" : "Book Appointment"}
                </Button>
              </Box>
            </TabPanel>
            
            {/* Reviews Tab */}
            <TabPanel value={tabValue} index={2}>
              <Box p={2}>
                <Box display="flex" alignItems="center" mb={3}>
                  <Rating value={doctor.rating} precision={0.1} readOnly />
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {doctor.rating.toFixed(1)}
        </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    ({doctor.reviewCount} reviews)
        </Typography>
      </Box>
      
                <Alert severity="info">
                  Patient reviews will be displayed here.
                </Alert>
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