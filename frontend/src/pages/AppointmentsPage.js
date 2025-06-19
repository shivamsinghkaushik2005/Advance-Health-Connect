import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondary,
  Divider,
  useTheme,
  Snackbar,
  Tooltip
} from '@mui/material';
import {
  Event as EventIcon,
  AccessTime as TimeIcon,
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Videocam as VideocamIcon,
  ContentCopy as ContentCopyIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import useAuth from '../hooks/useAuth';

const AppointmentsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const theme = useTheme();
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [selectedAppointmentForVideo, setSelectedAppointmentForVideo] = useState(null);
  const [meetingLink, setMeetingLink] = useState('');
  const [meetingLinkLoading, setMeetingLinkLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const messagesEndRef = useRef(null);

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

  const openVideoDialog = (appointment) => {
    setSelectedAppointment(appointment);
    setMeetingLink(appointment.meetingLink || '');
    setVideoDialogOpen(true);
  };

  const closeVideoDialog = () => {
    setVideoDialogOpen(false);
    setSelectedAppointment(null);
    setMeetingLink('');
  };

  const createMeetingLink = async () => {
    if (!selectedAppointment) return;
    
    try {
      setMeetingLinkLoading(true);
      // Generate a random meeting ID for Jitsi Meet
      const randomMeetingId = `healthconnect-${Math.random().toString(36).substring(2, 15)}`;
      const newMeetingLink = `https://meet.jit.si/${randomMeetingId}`;
      
      // Save the meeting link to the appointment
      const response = await axios.put(`/api/appointments/${selectedAppointment._id}/meeting-link`, {
        meetingLink: newMeetingLink
      });
      
      setMeetingLink(newMeetingLink);
      setSnackbarMessage(t('appointments.meetingLinkCreated'));
      setSnackbarOpen(true);
      
      // Update the appointment in the local state
      setAppointments(appointments.map(app => 
        app._id === selectedAppointment._id ? { ...app, meetingLink: newMeetingLink } : app
      ));
      setSelectedAppointment({ ...selectedAppointment, meetingLink: newMeetingLink });
      
      setMeetingLinkLoading(false);
    } catch (err) {
      console.error('Failed to create meeting link', err);
      setSnackbarMessage(t('appointments.meetingLinkError'));
      setSnackbarOpen(true);
      setMeetingLinkLoading(false);
    }
  };

  const copyMeetingLink = () => {
    if (meetingLink) {
      navigator.clipboard.writeText(meetingLink);
      setSnackbarMessage(t('appointments.meetingLinkCopied'));
      setSnackbarOpen(true);
    }
  };

  const joinVideoCall = () => {
    if (meetingLink) {
      window.open(meetingLink, '_blank');
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedAppointment) return;

    try {
      const response = await axios.post(`/api/chat/${selectedAppointment._id}`, {
        message: message.trim(),
        sender: user._id
      });
      
      setChatMessages([...chatMessages, response.data]);
      setMessage('');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return theme.palette.info.main;
      case 'completed':
        return theme.palette.success.main;
      case 'cancelled':
        return theme.palette.error.main;
      default:
        return theme.palette.warning.main;
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return <ScheduleIcon />;
      case 'completed':
        return <CheckCircleIcon />;
      case 'cancelled':
        return <CancelIcon />;
      default:
        return <EventIcon />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const renderAppointmentList = (appointmentList) => {
    if (appointmentList.length === 0) {
      return (
        <Box p={4} textAlign="center">
          <Typography color="text.secondary">No appointments found</Typography>
        </Box>
      );
    }

    return (
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {appointmentList.map((appointment, index) => (
          <React.Fragment key={appointment._id}>
            <ListItem
              alignItems="flex-start"
              sx={{
                py: 2,
                transition: 'background-color 0.2s',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: getStatusColor(appointment.status) }}>
                  {getStatusIcon(appointment.status)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" fontWeight="medium">
                      Dr. {appointment.doctorId.name}
                    </Typography>
                    <Chip
                      size="small"
                      label={appointment.status}
                      sx={{
                        bgcolor: `${getStatusColor(appointment.status)}15`,
                        color: getStatusColor(appointment.status),
                        fontWeight: 500
                      }}
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Box display="flex" alignItems="center" gap={2} mt={1}>
                      <Box display="flex" alignItems="center">
                        <EventIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(appointment.appointmentDate), 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <TimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {appointment.startTime} - {appointment.endTime}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" gap={1} mt={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ChatIcon />}
                        onClick={() => openChat(appointment)}
                        sx={{
                          borderColor: theme.palette.primary.main,
                          color: theme.palette.primary.main,
                          '&:hover': {
                            borderColor: theme.palette.primary.dark,
                            bgcolor: `${theme.palette.primary.main}10`
                          }
                        }}
                      >
                        {t('appointments.chat')}
                      </Button>
                      
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VideocamIcon />}
                        onClick={() => openVideoDialog(appointment)}
                        sx={{
                          borderColor: theme.palette.success.main,
                          color: theme.palette.success.main,
                          '&:hover': {
                            borderColor: theme.palette.success.dark,
                            bgcolor: `${theme.palette.success.main}10`
                          }
                        }}
                      >
                        {t('appointments.videoConsultation')}
                      </Button>
                    </Box>
                  </Box>
                }
              />
            </ListItem>
            {index < appointmentList.length - 1 && <Divider component="li" />}
          </React.Fragment>
        ))}
      </List>
    );
  };

  const upcomingAppointments = appointments.filter(
    app => app.status === 'scheduled'
  );
  
  const pastAppointments = appointments.filter(
    app => ['completed', 'cancelled'].includes(app.status)
  );

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.9rem'
            }
          }}
        >
          <Tab label={`Upcoming (${upcomingAppointments.length})`} />
          <Tab label={`Past (${pastAppointments.length})`} />
        </Tabs>
      </Box>

      <Box role="tabpanel" hidden={tabValue !== 0}>
        {tabValue === 0 && renderAppointmentList(upcomingAppointments)}
      </Box>
      <Box role="tabpanel" hidden={tabValue !== 1}>
        {tabValue === 1 && renderAppointmentList(pastAppointments)}
      </Box>

      {/* Chat Dialog */}
      <Dialog
        open={chatOpen}
        onClose={closeChat}
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
          bgcolor: theme.palette.primary.main, 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          Chat with Doctor
          <IconButton size="small" onClick={closeChat} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ height: 400, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
              {chatLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <CircularProgress />
                </Box>
              ) : chatMessages.length === 0 ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <Typography color="text.secondary">No messages yet</Typography>
                </Box>
              ) : (
                chatMessages.map((msg, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: msg.sender === user._id ? 'flex-end' : 'flex-start',
                      mb: 1
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: '70%',
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: msg.sender === user._id ? 
                          `${theme.palette.primary.main}15` : 
                          theme.palette.grey[100],
                        color: msg.sender === user._id ?
                          theme.palette.primary.main :
                          'text.primary'
                      }}
                    >
                      <Typography variant="body2">{msg.message}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {format(new Date(msg.timestamp), 'HH:mm')}
                      </Typography>
                    </Box>
                  </Box>
                ))
              )}
            </Box>
            <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3
                    }
                  }}
                />
                <IconButton 
                  color="primary"
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    '&:hover': {
                      bgcolor: theme.palette.primary.dark
                    },
                    '&.Mui-disabled': {
                      bgcolor: theme.palette.action.disabledBackground
                    }
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </DialogContent>
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
          bgcolor: theme.palette.success.main, 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {t('appointments.videoConsultation')}
          <IconButton size="small" onClick={closeVideoDialog} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {user?.userType === 'doctor' && (
              <Box>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  {t('appointments.createMeetingLink')}
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
                      t('appointments.createMeetingLink')
                    )}
                  </Button>
                </Box>
              </Box>
            )}
            
            {meetingLink ? (
              <Box>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  {t('appointments.joinVideoCall')}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  p: 2,
                  bgcolor: 'background.paper',
                  border: `1px solid ${theme.palette.divider}`,
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
                  <Tooltip title={t('appointments.copyMeetingLink')}>
                    <IconButton onClick={copyMeetingLink} size="small">
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
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
                    {t('appointments.joinVideoCall')}
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography color="text.secondary">
                  {user?.userType === 'doctor' 
                    ? t('appointments.createMeetingLink')
                    : t('appointments.noMeetingLink')}
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
    </Box>
  );
};

export default AppointmentsPage;