import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Tabs,
  Tab,
  Chip,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PaymentIcon from '@mui/icons-material/Payment';
import VideocamIcon from '@mui/icons-material/Videocam';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import useAuth from '../hooks/useAuth';

// Styled components
const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.875rem',
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 500,
  backgroundColor: 
    status === 'completed' ? theme.palette.success.light :
    status === 'scheduled' ? theme.palette.primary.light :
    status === 'cancelled' ? theme.palette.error.light :
    theme.palette.warning.light,
  color: 
    status === 'completed' ? theme.palette.success.contrastText :
    status === 'scheduled' ? theme.palette.primary.contrastText :
    status === 'cancelled' ? theme.palette.error.contrastText :
    theme.palette.warning.contrastText,
}));

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`appointments-tabpanel-${index}`}
    aria-labelledby={`appointments-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const AppointmentsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/appointments/patient');
        setAppointments(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load appointments. Please try again later.');
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const openChat = async (appointment) => {
    setSelectedAppointment(appointment);
    setChatOpen(true);
    
    // Fetch chat history
    try {
      setChatLoading(true);
      const response = await axios.get(`/api/chat/${appointment._id}`);
      setChatMessages(response.data || []);
      setChatLoading(false);
    } catch (err) {
      console.error('Failed to load chat history', err);
      setChatMessages([]);
      setChatLoading(false);
    }
  };

  const closeChat = () => {
    setChatOpen(false);
    setSelectedAppointment(null);
    setMessage('');
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedAppointment) return;
    
    try {
      const response = await axios.post('/api/chat', {
        appointmentId: selectedAppointment._id,
        senderId: user._id,
        receiverId: selectedAppointment.doctorId._id,
        message: message.trim(),
      });
      
      setChatMessages([...chatMessages, response.data]);
      setMessage('');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      await axios.put(`/api/appointments/${appointmentId}/cancel`);
      
      // Update the appointments list
      setAppointments(appointments.map(app => 
        app._id === appointmentId ? { ...app, status: 'cancelled' } : app
      ));
    } catch (err) {
      console.error('Failed to cancel appointment', err);
    }
  };

  const completePayment = async (appointmentId) => {
    try {
      await axios.put(`/api/appointments/${appointmentId}/payment`, {
        paymentStatus: 'completed'
      });
      
      // Update the appointments list
      setAppointments(appointments.map(app => 
        app._id === appointmentId ? { ...app, paymentStatus: 'completed' } : app
      ));
    } catch (err) {
      console.error('Failed to process payment', err);
    }
  };

  // Filter appointments based on tab
  const filteredAppointments = appointments.filter(appointment => {
    if (tabValue === 0) return true; // All
    if (tabValue === 1) return appointment.status === 'scheduled'; // Upcoming
    if (tabValue === 2) return appointment.status === 'completed'; // Past
    if (tabValue === 3) return appointment.status === 'cancelled'; // Cancelled
    return true;
  });

  const getStatusLabel = (status) => {
    switch(status) {
      case 'scheduled': return 'Scheduled';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'no-show': return 'No Show';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={8}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
        {t('appointments.myAppointments')}
      </Typography>
      
      <Paper elevation={3} sx={{ mt: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <StyledTab label="All" />
          <StyledTab label="Upcoming" />
          <StyledTab label="Past" />
          <StyledTab label="Cancelled" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          {renderAppointments(filteredAppointments)}
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          {renderAppointments(filteredAppointments)}
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          {renderAppointments(filteredAppointments)}
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          {renderAppointments(filteredAppointments)}
        </TabPanel>
      </Paper>
      
      {/* Chat Dialog */}
      <Dialog
        open={chatOpen}
        onClose={closeChat}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Chat with {selectedAppointment?.doctorId?.userId?.name}
        </DialogTitle>
        <DialogContent dividers>
          {chatLoading ? (
            <Box display="flex" justifyContent="center" my={2}>
              <CircularProgress size={24} />
            </Box>
          ) : chatMessages.length === 0 ? (
            <Box textAlign="center" py={3}>
              <Typography color="text.secondary">
                No messages yet. Start the conversation!
              </Typography>
            </Box>
          ) : (
            <List sx={{ width: '100%', maxHeight: 300, overflow: 'auto' }}>
              {chatMessages.map((msg, index) => (
                <ListItem
                  key={index}
                  alignItems="flex-start"
                  sx={{
                    textAlign: msg.senderId === user._id ? 'right' : 'left',
                    flexDirection: 'column',
                    alignItems: msg.senderId === user._id ? 'flex-end' : 'flex-start',
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '70%',
                      backgroundColor: msg.senderId === user._id ? 'primary.light' : 'grey.100',
                      color: msg.senderId === user._id ? 'primary.contrastText' : 'text.primary',
                      borderRadius: 2,
                      padding: 2,
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="body2">{msg.message}</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, display: 'flex' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <IconButton 
            color="primary" 
            onClick={sendMessage}
            disabled={!message.trim()}
          >
            <SendIcon />
          </IconButton>
        </DialogActions>
      </Dialog>
    </Container>
  );

  function renderAppointments(appointmentsList) {
    if (error) {
      return (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      );
    }

    if (appointmentsList.length === 0) {
      return (
        <Alert severity="info" sx={{ my: 2 }}>
          No appointments found.
        </Alert>
      );
    }

    return (
      <Grid container spacing={3}>
        {appointmentsList.map((appointment) => (
          <Grid item xs={12} md={6} key={appointment._id}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box display="flex" alignItems="center">
                    <Avatar 
                      src={`https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 70)}.jpg`} 
                      sx={{ width: 50, height: 50, mr: 2 }} 
                    />
                    <Box>
                      <Typography variant="h6">
                        {appointment.doctorId?.userId?.name || 'Doctor'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {appointment.doctorId?.speciality || 'Specialist'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <StatusChip 
                    label={getStatusLabel(appointment.status)}
                    status={appointment.status}
                    size="small"
                    icon={
                      appointment.status === 'completed' ? <CheckCircleIcon /> :
                      appointment.status === 'cancelled' ? <CancelIcon /> :
                      <EventIcon />
                    }
                  />
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box display="flex" alignItems="center">
                      <EventIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {formatDate(appointment.appointmentDate)}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Box display="flex" alignItems="center">
                      <AccessTimeIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {appointment.startTime} - {appointment.endTime}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  {appointment.symptoms && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Symptoms:</strong> {appointment.symptoms}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Payment Status:
                    </Typography>
                    <Chip
                      size="small"
                      label={appointment.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
                      color={appointment.paymentStatus === 'completed' ? 'success' : 'warning'}
                      variant="outlined"
                      icon={<PaymentIcon fontSize="small" />}
                    />
                  </Box>
                  
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    ₹{appointment.paymentAmount || appointment.doctorId?.fees || 0}
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between" mt={2}>
                  {appointment.status === 'scheduled' && (
                    <>
                      {appointment.paymentStatus !== 'completed' && (
                        <Button
                          variant="outlined"
                          color="primary"
                          startIcon={<PaymentIcon />}
                          onClick={() => completePayment(appointment._id)}
                        >
                          Pay Now
                        </Button>
                      )}
                      
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => cancelAppointment(appointment._id)}
                      >
                        Cancel
                      </Button>
                      
                      {appointment.paymentStatus === 'completed' && (
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<VideocamIcon />}
                        >
                          Join Call
                        </Button>
                      )}
                      
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<ChatIcon />}
                        onClick={() => openChat(appointment)}
                      >
                        Chat
                      </Button>
                    </>
                  )}
                  
                  {appointment.status === 'completed' && (
                    <>
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<LocalHospitalIcon />}
                      >
                        View Prescription
                      </Button>
                      
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<ChatIcon />}
                        onClick={() => openChat(appointment)}
                      >
                        Chat
                      </Button>
                    </>
                  )}
                  
                  {appointment.status === 'cancelled' && (
                    <Button
                      variant="outlined"
                      color="primary"
                      fullWidth
                    >
                      Book Again
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }
};

export default AppointmentsPage; 