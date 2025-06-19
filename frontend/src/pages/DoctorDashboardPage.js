import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Card,
  CardContent,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Divider,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  ListItemIcon,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  InputAdornment,
  Snackbar,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  PersonOutline as PatientIcon,
  MedicalServices as MedicalIcon,
  AccessTime as TimeIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
  AttachMoney as PaymentIcon,
  Person as UserIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Chat as ChatIcon,
  AccessTime,
  AccountCircle as AccountCircleIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Event as EventIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Videocam as VideocamIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import useAuth from '../hooks/useAuth';
import DoctorImageUpload from '../components/DoctorImageUpload';
import DoctorAvailabilityCalendar from '../components/DoctorAvailabilityCalendar';

// Tab Panel Component
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`doctor-dashboard-tabpanel-${index}`}
      aria-labelledby={`doctor-dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

// Status Chip Component
const StatusChip = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Chip
      label={status}
      color={getStatusColor()}
      size="small"
      sx={{ textTransform: 'capitalize' }}
    />
  );
};

// Payment Status Chip Component
const PaymentChip = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Chip
      label={status}
      color={getStatusColor()}
      size="small"
      sx={{ textTransform: 'capitalize' }}
    />
  );
};

const DoctorDashboardPage = () => {
  const { user, isAuthenticated, logout, setUser, setIsAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Add debug logging
  console.log('DoctorDashboardPage - User:', user);
  console.log('DoctorDashboardPage - isAuthenticated:', isAuthenticated);
  
  const [appointments, setAppointments] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [patientDialogOpen, setPatientDialogOpen] = useState(false);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  
  // Video consultation states
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [selectedAppointmentForVideo, setSelectedAppointmentForVideo] = useState(null);
  const [meetingLink, setMeetingLink] = useState('');
  const [meetingLinkLoading, setMeetingLinkLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    speciality: '',
    licenseNumber: '',
    fees: 0,
    languages: [],
    education: [],
    experience: [],
    availability: []
  });
  const [success, setSuccess] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [language, setLanguage] = useState('');
  const [newEducation, setNewEducation] = useState({ degree: '', institution: '', year: '' });
  const [newExperience, setNewExperience] = useState({ hospital: '', position: '', duration: '' });

  // Add axios interceptor to handle token
  useEffect(() => {
    // Add request interceptor
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle 401 errors
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear auth state on 401 errors
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
          navigate('/login');
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptors on component unmount
    return () => {
      axios.interceptors.request.eject(interceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [navigate, setUser, setIsAuthenticated]);

  useEffect(() => {
    // Redirect if not logged in or not a doctor
    if (!isAuthenticated || !user || user.userType !== 'doctor') {
      console.log('Debug - Auth check failed:', { isAuthenticated, user });
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Debug - Starting data fetch for user:', user);
        
        // First find the doctor profile using userId
        console.log('Debug - Fetching doctor profile for userId:', user._id);
        const profileResponse = await axios.get(`/api/doctors/profile/${user._id}`);
        console.log('Debug - Doctor profile response:', profileResponse.data);
        
        const doctorProfileData = profileResponse.data;
        setDoctorProfile(doctorProfileData);

        // If profile is empty (newly created), show edit mode and profile tab
        if (!doctorProfileData.speciality || !doctorProfileData.licenseNumber || doctorProfileData.fees === 0) {
          console.log('Debug - Empty doctor profile, showing edit mode');
          setEditing(true);
          setTabValue(4); // Switch to profile tab (index updated after adding Availability Calendar tab)
          setError('Please complete your profile setup to start accepting appointments.');
          setLoading(false);
          return;
        }

        // Now fetch appointments
        console.log('Debug - Fetching appointments');
        const appointmentsResponse = await axios.get('/api/appointments', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log('Debug - Raw appointments response:', appointmentsResponse.data);

        if (appointmentsResponse.data && Array.isArray(appointmentsResponse.data)) {
          const appointments = appointmentsResponse.data;
          console.log('Debug - Processing appointments:', appointments);
          setAppointments(appointments);
          
          // Filter appointments for different views
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const todayAppts = appointments.filter(appointment => {
            const apptDate = new Date(appointment.appointmentDate);
            apptDate.setHours(0, 0, 0, 0);
            const isToday = apptDate.getTime() === today.getTime();
            const notCancelled = appointment.status !== 'cancelled';
            console.log('Debug - Today appointment check:', {
              appointmentId: appointment._id,
              date: apptDate,
              isToday,
              notCancelled,
              status: appointment.status
            });
            return isToday && notCancelled;
          });
          
          const upcomingAppts = appointments.filter(appointment => {
            const apptDate = new Date(appointment.appointmentDate);
            apptDate.setHours(0, 0, 0, 0);
            const isFuture = apptDate.getTime() > today.getTime();
            const notCancelled = appointment.status !== 'cancelled';
            console.log('Debug - Upcoming appointment check:', {
              appointmentId: appointment._id,
              date: apptDate,
              isFuture,
              notCancelled,
              status: appointment.status
            });
            return isFuture && notCancelled;
          });
          
          const pastAppts = appointments.filter(appointment => {
            const apptDate = new Date(appointment.appointmentDate);
            apptDate.setHours(0, 0, 0, 0);
            const isPast = apptDate.getTime() < today.getTime();
            const isCompleted = appointment.status === 'completed';
            console.log('Debug - Past appointment check:', {
              appointmentId: appointment._id,
              date: apptDate,
              isPast,
              isCompleted,
              status: appointment.status
            });
            return isPast || isCompleted;
          });

          console.log('Debug - Filtered appointments:', {
            total: appointments.length,
            today: todayAppts.length,
            upcoming: upcomingAppts.length,
            past: pastAppts.length
          });

          setTodayAppointments(todayAppts);
          setUpcomingAppointments(upcomingAppts);
          setPastAppointments(pastAppts);
        } else {
          console.log('Debug - No appointments found or invalid response:', appointmentsResponse.data);
          setTodayAppointments([]);
          setUpcomingAppointments([]);
          setPastAppointments([]);
        }
      } catch (err) {
        console.error('Debug - Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          stack: err.stack
        });
        
        if (err.response?.status === 401) {
          setError('Your session has expired. Please login again.');
          logout();
          navigate('/login');
          return;
        }
        
        if (err.response?.status === 404) {
          if (err.response?.data?.message === 'Doctor profile not found') {
            setEditing(true);
            setTabValue(3); // Switch to profile tab
            setError('Please complete your profile setup to start accepting appointments.');
          } else {
            setError('Could not find your doctor profile. Please contact support.');
          }
        } else {
          setError(err.response?.data?.message || err.message || 'Failed to load data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isAuthenticated, navigate, logout]);

  // Initialize form data when doctor profile is loaded
  useEffect(() => {
    if (doctorProfile) {
      setFormData({
        speciality: doctorProfile.speciality || '',
        licenseNumber: doctorProfile.licenseNumber || '',
        fees: doctorProfile.fees || 0,
        languages: doctorProfile.languages || [],
        education: doctorProfile.education || [],
        experience: doctorProfile.experience || [],
        availability: doctorProfile.availability || []
      });
    }
  }, [doctorProfile]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewPatient = (appointment) => {
    setSelectedPatient(appointment.patientId);
    setSelectedAppointment(appointment);
    setPatientDialogOpen(true);
  };

  const handleClosePatientDialog = () => {
    setPatientDialogOpen(false);
    setSelectedPatient(null);
    setSelectedAppointment(null);
  };

  const handleStartChat = (appointmentId) => {
    navigate(`/chat/${appointmentId}`);
  };

  const handleVideoConsultation = (appointment) => {
    setSelectedAppointmentForVideo(appointment);
    setMeetingLink(appointment.meetingLink || '');
    setVideoDialogOpen(true);
  };

  const closeVideoDialog = () => {
    setVideoDialogOpen(false);
    setSelectedAppointmentForVideo(null);
    setMeetingLink('');
  };

  const createMeetingLink = async () => {
    if (!selectedAppointmentForVideo) return;
    
    try {
      setMeetingLinkLoading(true);
      // Generate a random meeting ID for Jitsi Meet
      const randomMeetingId = `healthconnect-${Math.random().toString(36).substring(2, 15)}`;
      const newMeetingLink = `https://meet.jit.si/${randomMeetingId}`;
      
      // Save the meeting link to the appointment
      const response = await axios.put(`/api/appointments/${selectedAppointmentForVideo._id}/meeting-link`, {
        meetingLink: newMeetingLink
      });
      
      setMeetingLink(newMeetingLink);
      setSnackbarMessage('Meeting link created successfully');
      setSnackbarOpen(true);
      
      // Update the appointment in the local state
      const updatedAppointments = appointments.map(app => 
        app._id === selectedAppointmentForVideo._id ? { ...app, meetingLink: newMeetingLink } : app
      );
      setAppointments(updatedAppointments);
      setSelectedAppointmentForVideo({ ...selectedAppointmentForVideo, meetingLink: newMeetingLink });
      
      // Update filtered lists
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayAppts = updatedAppointments.filter(appointment => {
        const apptDate = new Date(appointment.appointmentDate);
        apptDate.setHours(0, 0, 0, 0);
        return apptDate.getTime() === today.getTime() && appointment.status !== 'cancelled';
      });
      
      const upcomingAppts = updatedAppointments.filter(appointment => {
        const apptDate = new Date(appointment.appointmentDate);
        apptDate.setHours(0, 0, 0, 0);
        return apptDate.getTime() > today.getTime() && appointment.status !== 'cancelled';
      });
      
      const pastAppts = updatedAppointments.filter(appointment => {
        const apptDate = new Date(appointment.appointmentDate);
        apptDate.setHours(0, 0, 0, 0);
        return (apptDate.getTime() < today.getTime() || appointment.status === 'completed');
      });
      
      setTodayAppointments(todayAppts);
      setUpcomingAppointments(upcomingAppts);
      setPastAppointments(pastAppts);
      
      setMeetingLinkLoading(false);
    } catch (err) {
      console.error('Failed to create meeting link', err);
      setSnackbarMessage('Error creating meeting link');
      setSnackbarOpen(true);
      setMeetingLinkLoading(false);
    }
  };

  const copyMeetingLink = () => {
    if (meetingLink) {
      navigator.clipboard.writeText(meetingLink);
      setSnackbarMessage('Meeting link copied to clipboard');
      setSnackbarOpen(true);
    }
  };

  const joinVideoCall = () => {
    if (meetingLink) {
      window.open(meetingLink, '_blank');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`/api/appointments/${id}`, { status });
      
      // Update local state
      const updatedAppointments = appointments.map(appointment => 
        appointment._id === id ? { ...appointment, status } : appointment
      );
      
      setAppointments(updatedAppointments);
      
      // Update filtered lists
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Recalculate filtered lists
      const todayAppts = updatedAppointments.filter(appointment => {
        const apptDate = new Date(appointment.appointmentDate);
        apptDate.setHours(0, 0, 0, 0);
        return apptDate.getTime() === today.getTime() && appointment.status !== 'cancelled';
      });
      
      const upcomingAppts = updatedAppointments.filter(appointment => {
        const apptDate = new Date(appointment.appointmentDate);
        apptDate.setHours(0, 0, 0, 0);
        return apptDate.getTime() > today.getTime() && appointment.status !== 'cancelled';
      });
      
      const pastAppts = updatedAppointments.filter(appointment => {
        const apptDate = new Date(appointment.appointmentDate);
        apptDate.setHours(0, 0, 0, 0);
        return (apptDate.getTime() < today.getTime() || appointment.status === 'completed');
      });
      
      setTodayAppointments(todayAppts);
      setUpcomingAppointments(upcomingAppts);
      setPastAppointments(pastAppts);
      
    } catch (err) {
      console.error('Error updating appointment status:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update appointment status. Please try again.';
      setError(errorMessage);
    }
  };
  
  const renderAppointmentTable = (appointmentList) => {
    if (appointmentList.length === 0) {
      return <Alert severity="info">No appointments found</Alert>;
    }
    
    return (
      <TableContainer component={Paper} elevation={3}>
        <Table aria-label="appointments table">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white' }}>Patient</TableCell>
              <TableCell sx={{ color: 'white' }}>Contact</TableCell>
              <TableCell sx={{ color: 'white' }}>Date</TableCell>
              <TableCell sx={{ color: 'white' }}>Time</TableCell>
              <TableCell sx={{ color: 'white' }}>Status</TableCell>
              <TableCell sx={{ color: 'white' }}>Payment</TableCell>
              <TableCell sx={{ color: 'white' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointmentList.map((appointment) => (
              <TableRow key={appointment._id}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ mr: 1, bgcolor: 'primary.light' }}>
                      {appointment.patientId?.name ? appointment.patientId.name.charAt(0) : 'P'}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">{appointment.patientId?.name || 'Unknown Patient'}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        ID: {appointment.patientId?._id || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      <EmailIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                      {appointment.patientId?.email || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <PhoneIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                      {appointment.patientId?.phoneNumber || 'N/A'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {format(new Date(appointment.appointmentDate), 'dd MMM yyyy')}
                </TableCell>
                <TableCell>
                  {appointment.startTime} - {appointment.endTime}
                </TableCell>
                <TableCell>
                  <StatusChip status={appointment.status} />
                </TableCell>
                <TableCell>
                  <PaymentChip status={appointment.paymentStatus} />
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Button 
                      size="small" 
                      variant="outlined"
                      onClick={() => handleViewPatient(appointment)}
                    >
                      View
                    </Button>
                    
                    {appointment.status === 'scheduled' && (
                      <>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="success"
                          onClick={() => handleUpdateStatus(appointment._id, 'completed')}
                        >
                          Complete
                        </Button>
                        
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="error"
                          onClick={() => handleUpdateStatus(appointment._id, 'cancelled')}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    
                    <Button 
                      size="small" 
                      variant="outlined" 
                      color="primary"
                      onClick={() => handleStartChat(appointment._id)}
                      startIcon={<ChatIcon />}
                    >
                      Chat
                    </Button>
                    
                    <Button 
                      size="small" 
                      variant="outlined" 
                      color="success"
                      onClick={() => handleVideoConsultation(appointment)}
                      startIcon={<VideocamIcon />}
                    >
                      Video
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddLanguage = () => {
    if (language && !formData.languages.includes(language)) {
      setFormData({
        ...formData,
        languages: [...formData.languages, language]
      });
      setLanguage('');
    }
  };

  const handleRemoveLanguage = (langToRemove) => {
    setFormData({
      ...formData,
      languages: formData.languages.filter(lang => lang !== langToRemove)
    });
  };

  const handleEducationChange = (e, index, field) => {
    const updatedEducation = [...formData.education];
    updatedEducation[index][field] = e.target.value;
    setFormData({
      ...formData,
      education: updatedEducation
    });
  };

  const handleAddEducation = () => {
    if (newEducation.degree && newEducation.institution) {
      setFormData({
        ...formData,
        education: [...formData.education, { ...newEducation }]
      });
      setNewEducation({ degree: '', institution: '', year: '' });
    }
  };

  const handleRemoveEducation = (index) => {
    const updatedEducation = [...formData.education];
    updatedEducation.splice(index, 1);
    setFormData({
      ...formData,
      education: updatedEducation
    });
  };

  const handleExperienceChange = (e, index, field) => {
    const updatedExperience = [...formData.experience];
    updatedExperience[index][field] = e.target.value;
    setFormData({
      ...formData,
      experience: updatedExperience
    });
  };

  const handleAddExperience = () => {
    if (newExperience.position && newExperience.hospital) {
      setFormData({
        ...formData,
        experience: [...formData.experience, { ...newExperience }]
      });
      setNewExperience({ hospital: '', position: '', duration: '' });
    }
  };

  const handleRemoveExperience = (index) => {
    const updatedExperience = [...formData.experience];
    updatedExperience.splice(index, 1);
    setFormData({
      ...formData,
      experience: updatedExperience
    });
  };

  const handleStartEditing = () => {
    setEditing(true);
    setUpdateError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setUpdateError('');
    setSuccess('');
    // Reset form data to current doctor profile
    if (doctorProfile) {
      setFormData({
        speciality: doctorProfile.speciality || '',
        licenseNumber: doctorProfile.licenseNumber || '',
        fees: doctorProfile.fees || 0,
        languages: doctorProfile.languages || [],
        education: doctorProfile.education || [],
        experience: doctorProfile.experience || [],
        availability: doctorProfile.availability || []
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      setUpdateError('');
      setSuccess('');
      
      const response = await axios.put(
        `/api/doctors/${doctorProfile._id}`, 
        formData
      );
      
      if (response.data) {
        setDoctorProfile(response.data);
        setEditing(false);
        setSuccess('Profile updated successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error updating doctor profile:', error);
      setUpdateError(error.response?.data?.message || 'Failed to update profile. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Overview Cards */}
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>Doctor Dashboard</Typography>
          <Typography variant="subtitle1" color="textSecondary" paragraph>
            Welcome, Dr. {user?.name}. Here's your appointment overview.
          </Typography>
        </Grid>
        
        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Today's Appointments</Typography>
                <CalendarIcon fontSize="large" />
              </Box>
              <Typography variant="h3" sx={{ mt: 2, mb: 1 }}>
                {todayAppointments.length}
              </Typography>
              <Typography variant="body2">
                {todayAppointments.length > 0 
                  ? `Next appointment: ${todayAppointments[0]?.startTime}`
                  : 'No appointments today'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ bgcolor: 'success.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Upcoming</Typography>
                <PatientIcon fontSize="large" />
              </Box>
              <Typography variant="h3" sx={{ mt: 2, mb: 1 }}>
                {upcomingAppointments.length}
              </Typography>
              <Typography variant="body2">
                Scheduled for future dates
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ bgcolor: 'info.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Completed</Typography>
                <MedicalIcon fontSize="large" />
              </Box>
              <Typography variant="h3" sx={{ mt: 2, mb: 1 }}>
                {pastAppointments.length}
              </Typography>
              <Typography variant="body2">
                Total completed consultations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Appointment Tabs */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ mt: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="appointment tabs">
                <Tab label="Today's Appointments" />
                <Tab label="Upcoming Appointments" />
                <Tab label="Past Appointments" />
                <Tab label="Availability Calendar" />
                <Tab label="Profile" />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>Today's Appointments</Typography>
              {renderAppointmentTable(todayAppointments)}
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>Upcoming Appointments</Typography>
              {renderAppointmentTable(upcomingAppointments)}
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>Past Appointments</Typography>
              {renderAppointmentTable(pastAppointments)}
            </TabPanel>
            
            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" gutterBottom>Availability Calendar</Typography>
              <DoctorAvailabilityCalendar doctorId={doctorProfile?._id} />
            </TabPanel>
            
            <TabPanel value={tabValue} index={4}>
              <Typography variant="h6" gutterBottom>Profile</Typography>
              
              {/* Success and Error Messages */}
              {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                  {success}
                </Alert>
              )}
              
              {updateError && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setUpdateError('')}>
                  {updateError}
                </Alert>
              )}
              
              {loadingProfile ? (
                <Box display="flex" justifyContent="center" my={3}>
                  <CircularProgress />
                </Box>
              ) : profileError ? (
                <Alert severity="error">{profileError}</Alert>
              ) : doctorProfile ? (
                <Grid container spacing={3}>
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    {!editing ? (
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<EditIcon />}
                        onClick={handleStartEditing}
                      >
                        Edit Profile
                      </Button>
                    ) : (
                      <Box display="flex" gap={2}>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<CancelIcon />}
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<SaveIcon />}
                          onClick={handleSaveProfile}
                        >
                          Save Changes
                        </Button>
                      </Box>
                    )}
                  </Grid>
                
                  <Grid item xs={12} md={6}>
                    <DoctorImageUpload 
                      doctorId={doctorProfile._id} 
                      onSuccess={(imagePath) => {
                        setDoctorProfile({
                          ...doctorProfile,
                          image: imagePath
                        });
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box p={2} border="1px solid #e0e0e0" borderRadius={1}>
                      <Typography variant="h6">Current Profile Image</Typography>
                      <Box mt={2} display="flex" justifyContent="center">
                        {doctorProfile.image ? (
                          <img 
                            src={doctorProfile.image} 
                            alt="Doctor Profile" 
                            style={{ 
                              maxWidth: '100%', 
                              maxHeight: '200px', 
                              borderRadius: '4px' 
                            }} 
                          />
                        ) : (
                          <Typography color="textSecondary">No profile image set</Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                  
                  {/* Doctor Professional Details */}
                  <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
                      <Typography variant="h6" color="primary" gutterBottom>
                        Professional Information
                      </Typography>
                      
                      {!editing ? (
                        // Display mode
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Specialization
                            </Typography>
                            <Typography variant="body1">
                              {doctorProfile.speciality || 'Not specified'}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Consultation Fee
                            </Typography>
                            <Typography variant="body1">
                              ₹{doctorProfile.fees || '0'}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Languages
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
                              {doctorProfile.languages && doctorProfile.languages.length > 0 ? 
                                doctorProfile.languages.map((lang, index) => (
                                  <Chip key={index} label={lang} size="small" />
                                )) : 
                                <Typography variant="body2">No languages specified</Typography>
                              }
                            </Box>
                          </Grid>
                        </Grid>
                      ) : (
                        // Edit mode
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Specialization"
                              name="speciality"
                              value={formData.speciality}
                              onChange={handleInputChange}
                              required
                              size="small"
                            />
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="License Number"
                              name="licenseNumber"
                              value={formData.licenseNumber}
                              onChange={handleInputChange}
                              required
                              size="small"
                            />
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Consultation Fee"
                              name="fees"
                              type="number"
                              value={formData.fees}
                              onChange={handleInputChange}
                              required
                              size="small"
                              InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                              }}
                            />
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                              Languages
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
                              {formData.languages.map((lang, index) => (
                                <Chip 
                                  key={index} 
                                  label={lang} 
                                  size="small"
                                  onDelete={() => handleRemoveLanguage(lang)}
                                />
                              ))}
                            </Box>
                            <Box display="flex" gap={1}>
                              <TextField
                                label="Add Language"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                size="small"
                              />
                              <Button 
                                variant="outlined" 
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={handleAddLanguage}
                              >
                                Add
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      )}
                    </Paper>
                  </Grid>
                  
                  {/* Education */}
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3, mt: 2, height: '100%' }}>
                      <Typography variant="h6" color="primary" gutterBottom>
                        Education
                      </Typography>
                      
                      {!editing ? (
                        // Display mode
                        <>
                          {doctorProfile.education && doctorProfile.education.length > 0 ? (
                            <List dense>
                              {doctorProfile.education.map((edu, index) => (
                                <ListItem key={index} alignItems="flex-start">
                                  <ListItemIcon>
                                    <SchoolIcon color="primary" />
                                  </ListItemIcon>
                                  <ListItemText 
                                    primary={edu.degree} 
                                    secondary={
                                      <>
                                        <Typography component="span" variant="body2" color="text.primary">
                                          {edu.institution}
                                        </Typography>
                                        {edu.year && ` — ${edu.year}`}
                                      </>
                                    }
                                  />
                                </ListItem>
                              ))}
                            </List>
                          ) : (
                            <Typography color="text.secondary">No education details added</Typography>
                          )}
                        </>
                      ) : (
                        // Edit mode
                        <>
                          {formData.education.map((edu, index) => (
                            <Box key={index} sx={{ mb: 2, p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="subtitle2">Education #{index + 1}</Typography>
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => handleRemoveEducation(index)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                              <Grid container spacing={1}>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    label="Degree"
                                    value={edu.degree}
                                    onChange={(e) => handleEducationChange(e, index, 'degree')}
                                    size="small"
                                    margin="dense"
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    label="Institution"
                                    value={edu.institution}
                                    onChange={(e) => handleEducationChange(e, index, 'institution')}
                                    size="small"
                                    margin="dense"
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    label="Year"
                                    type="number"
                                    value={edu.year}
                                    onChange={(e) => handleEducationChange(e, index, 'year')}
                                    size="small"
                                    margin="dense"
                                  />
                                </Grid>
                              </Grid>
                            </Box>
                          ))}
                          
                          <Box sx={{ mt: 3, p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Add New Education
                            </Typography>
                            <Grid container spacing={1}>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Degree"
                                  value={newEducation.degree}
                                  onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                                  size="small"
                                  margin="dense"
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Institution"
                                  value={newEducation.institution}
                                  onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})}
                                  size="small"
                                  margin="dense"
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Year"
                                  type="number"
                                  value={newEducation.year}
                                  onChange={(e) => setNewEducation({...newEducation, year: e.target.value})}
                                  size="small"
                                  margin="dense"
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <Button
                                  variant="outlined"
                                  startIcon={<AddIcon />}
                                  onClick={handleAddEducation}
                                  fullWidth
                                >
                                  Add Education
                                </Button>
                              </Grid>
                            </Grid>
                          </Box>
                        </>
                      )}
                    </Paper>
                  </Grid>
                  
                  {/* Experience */}
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3, mt: 2, height: '100%' }}>
                      <Typography variant="h6" color="primary" gutterBottom>
                        Experience
                      </Typography>
                      
                      {!editing ? (
                        // Display mode
                        <>
                          {doctorProfile.experience && doctorProfile.experience.length > 0 ? (
                            <List dense>
                              {doctorProfile.experience.map((exp, index) => (
                                <ListItem key={index} alignItems="flex-start">
                                  <ListItemIcon>
                                    <WorkIcon color="primary" />
                                  </ListItemIcon>
                                  <ListItemText 
                                    primary={exp.position} 
                                    secondary={
                                      <>
                                        <Typography component="span" variant="body2" color="text.primary">
                                          {exp.hospital}
                                        </Typography>
                                        {exp.duration && ` — ${exp.duration}`}
                                      </>
                                    }
                                  />
                                </ListItem>
                              ))}
                            </List>
                          ) : (
                            <Typography color="text.secondary">No experience details added</Typography>
                          )}
                        </>
                      ) : (
                        // Edit mode
                        <>
                          {formData.experience.map((exp, index) => (
                            <Box key={index} sx={{ mb: 2, p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="subtitle2">Experience #{index + 1}</Typography>
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => handleRemoveExperience(index)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                              <Grid container spacing={1}>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    label="Position"
                                    value={exp.position}
                                    onChange={(e) => handleExperienceChange(e, index, 'position')}
                                    size="small"
                                    margin="dense"
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    label="Hospital/Clinic"
                                    value={exp.hospital}
                                    onChange={(e) => handleExperienceChange(e, index, 'hospital')}
                                    size="small"
                                    margin="dense"
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    label="Duration"
                                    value={exp.duration}
                                    onChange={(e) => handleExperienceChange(e, index, 'duration')}
                                    size="small"
                                    margin="dense"
                                    placeholder="e.g. 2018-2021"
                                  />
                                </Grid>
                              </Grid>
                            </Box>
                          ))}
                          
                          <Box sx={{ mt: 3, p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Add New Experience
                            </Typography>
                            <Grid container spacing={1}>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Position"
                                  value={newExperience.position}
                                  onChange={(e) => setNewExperience({...newExperience, position: e.target.value})}
                                  size="small"
                                  margin="dense"
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Hospital/Clinic"
                                  value={newExperience.hospital}
                                  onChange={(e) => setNewExperience({...newExperience, hospital: e.target.value})}
                                  size="small"
                                  margin="dense"
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Duration"
                                  value={newExperience.duration}
                                  onChange={(e) => setNewExperience({...newExperience, duration: e.target.value})}
                                  size="small"
                                  margin="dense"
                                  placeholder="e.g. 2018-2021"
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <Button
                                  variant="outlined"
                                  startIcon={<AddIcon />}
                                  onClick={handleAddExperience}
                                  fullWidth
                                >
                                  Add Experience
                                </Button>
                              </Grid>
                            </Grid>
                          </Box>
                        </>
                      )}
                    </Paper>
                  </Grid>
                  
                  {/* Availability */}
                  <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
                      <Typography variant="h6" color="primary" gutterBottom>
                        Availability
                      </Typography>
                      
                      {!editing ? (
                        // Display mode
                        <>
                          {doctorProfile.availability && doctorProfile.availability.length > 0 ? (
                            <Box display="flex" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
                              {doctorProfile.availability.map((day, index) => (
                                <Chip
                                  key={index}
                                  label={day.day}
                                  color="primary"
                                  variant="outlined"
                                  icon={<EventIcon />}
                                />
                              ))}
                            </Box>
                          ) : (
                            <Typography color="text.secondary">No availability schedule set</Typography>
                          )}
                        </>
                      ) : (
                        <Typography color="text.secondary" sx={{ mt: 1 }}>
                          Note: Availability schedule can be managed from the admin dashboard for better slot management.
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="info">Doctor profile not found. Please contact an administrator.</Alert>
              )}
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Patient Details Dialog */}
      <Dialog
        open={patientDialogOpen}
        onClose={handleClosePatientDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Patient Details
          <IconButton
            aria-label="close"
            onClick={handleClosePatientDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedPatient && selectedAppointment && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Patient Information</Typography>
                    <List>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <UserIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary="Name" 
                          secondary={selectedPatient.name} 
                        />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <EmailIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary="Email" 
                          secondary={selectedPatient.email} 
                        />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <PhoneIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary="Phone" 
                          secondary={selectedPatient.phoneNumber || 'Not provided'} 
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Appointment Details</Typography>
                    <List>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <CalendarIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary="Date" 
                          secondary={format(new Date(selectedAppointment.appointmentDate), 'PPP')} 
                        />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <TimeIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary="Time" 
                          secondary={`${selectedAppointment.startTime} - ${selectedAppointment.endTime}`} 
                        />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            {selectedAppointment.status === 'completed' ? <CheckIcon /> : 
                              selectedAppointment.status === 'cancelled' ? <CancelIcon /> : 
                              <AccessTime />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary="Status" 
                          secondary={selectedAppointment.status} 
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Medical Information</Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Typography variant="subtitle1" gutterBottom>Symptoms/Reason for Visit:</Typography>
                    <Typography variant="body2" paragraph>
                      {selectedAppointment.symptoms || 'No symptoms recorded'}
                    </Typography>
                    
                    <Typography variant="subtitle1" gutterBottom>Additional Notes:</Typography>
                    <Typography variant="body2" paragraph>
                      {selectedAppointment.notes || 'No additional notes'}
                    </Typography>
                    
                    {selectedAppointment.prescription && (
                      <>
                        <Typography variant="subtitle1" gutterBottom>Prescription Information:</Typography>
                        <Typography variant="body2" paragraph>
                          <strong>Diagnosis:</strong> {selectedAppointment.prescription.diagnosis}<br />
                          <strong>Medicines:</strong> {selectedAppointment.prescription.medicines}<br />
                          <strong>Advice:</strong> {selectedAppointment.prescription.advice}<br />
                          <strong>Follow-up Date:</strong> {selectedAppointment.prescription.followUpDate ? 
                            format(new Date(selectedAppointment.prescription.followUpDate), 'PPP') : 'None'}
                        </Typography>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => handleStartChat(selectedAppointment._id)}
            startIcon={<ChatIcon />}
          >
            Chat with Patient
          </Button>
          <Button onClick={handleClosePatientDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Video Consultation Dialog */}
      <Dialog
        open={videoDialogOpen}
        onClose={closeVideoDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'success.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          Video Consultation
          <IconButton size="small" onClick={closeVideoDialog} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Create Meeting Link
              </Typography>
              <Box display="flex" gap={1} mt={1}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<AddIcon />}
                  onClick={createMeetingLink}
                  disabled={meetingLinkLoading}
                >
                  {meetingLinkLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Create Meeting Link'
                  )}
                </Button>
              </Box>
            </Box>
            
            {meetingLink ? (
              <Box>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  Join Video Call
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  p: 2,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {meetingLink}
                  </Typography>
                  <IconButton onClick={copyMeetingLink} size="small">
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Box display="flex" justifyContent="center" mt={3}>
                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    startIcon={<VideocamIcon />}
                    onClick={joinVideoCall}
                    sx={{ px: 4 }}
                  >
                    Join Video Call
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography color="text.secondary">
                  No meeting link available. Create one to start a video consultation.
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
};

export default DoctorDashboardPage;