import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const AppointmentBookingCalendar = ({ doctorId, doctorName, doctorFees }) => {
  const [availability, setAvailability] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [events, setEvents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');

  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];

  useEffect(() => {
    fetchDoctorAvailability();
    fetchExistingAppointments();
  }, [doctorId]);

  useEffect(() => {
    // Combine availability and appointments to create calendar events
    generateCalendarEvents();
  }, [availability, appointments]);

  const fetchDoctorAvailability = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/doctors/availability/${doctorId}`);
      setAvailability(response.data.availability || []);
    } catch (err) {
      console.error('Error fetching doctor availability:', err);
      setError('Failed to load doctor availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingAppointments = async () => {
    try {
      const response = await axios.get(`/api/appointments/doctor/${doctorId}`);
      setAppointments(response.data || []);
    } catch (err) {
      console.error('Error fetching existing appointments:', err);
      // We don't set error here to avoid blocking the UI if only appointments fail to load
    }
  };

  const generateCalendarEvents = () => {
    const newEvents = [];

    // First, add all available slots
    availability.forEach((dayAvail) => {
      const dayIndex = days.indexOf(dayAvail.day);
      if (dayIndex !== -1) {
        dayAvail.slots.forEach((slot) => {
          // Create events for the next 4 weeks
          for (let week = 0; week < 4; week++) {
            const today = new Date();
            const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
            const daysUntilNext = (dayIndex + 7 - currentDayOfWeek) % 7;
            
            // Calculate the date for this occurrence
            const eventDate = new Date(today);
            eventDate.setDate(today.getDate() + daysUntilNext + (week * 7));
            
            // Skip dates in the past
            if (eventDate < today && week === 0) continue;
            
            // Format the date as YYYY-MM-DD
            const dateStr = eventDate.toISOString().split('T')[0];
            
            newEvents.push({
              title: 'Available',
              start: `${dateStr}T${slot.startTime}`,
              end: `${dateStr}T${slot.endTime}`,
              backgroundColor: '#4caf50',
              borderColor: '#4caf50',
              textColor: '#ffffff',
              extendedProps: {
                type: 'available',
                dayName: dayAvail.day,
                startTime: slot.startTime,
                endTime: slot.endTime,
                dateStr: dateStr
              }
            });
          }
        });
      }
    });

    // Then, mark booked slots
    appointments.forEach((appointment) => {
      const appointmentDate = new Date(appointment.appointmentDate);
      const dateStr = appointmentDate.toISOString().split('T')[0];
      
      // Find and remove the corresponding available event
      const availableEventIndex = newEvents.findIndex(event => 
        event.extendedProps.type === 'available' &&
        event.extendedProps.dateStr === dateStr &&
        event.extendedProps.startTime === appointment.startTime &&
        event.extendedProps.endTime === appointment.endTime
      );
      
      if (availableEventIndex !== -1) {
        newEvents.splice(availableEventIndex, 1);
      }
      
      // Add the booked event
      newEvents.push({
        title: 'Booked',
        start: `${dateStr}T${appointment.startTime}`,
        end: `${dateStr}T${appointment.endTime}`,
        backgroundColor: '#f44336',
        borderColor: '#f44336',
        textColor: '#ffffff',
        extendedProps: {
          type: 'booked',
          appointmentId: appointment._id
        }
      });
    });

    setEvents(newEvents);
  };

  const handleEventClick = (info) => {
    const eventType = info.event.extendedProps.type;
    
    if (eventType === 'available') {
      setSelectedEvent({
        dateStr: info.event.extendedProps.dateStr,
        startTime: info.event.extendedProps.startTime,
        endTime: info.event.extendedProps.endTime,
        dayName: info.event.extendedProps.dayName
      });
      setOpenDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEvent(null);
    setSymptoms('');
    setNotes('');
  };

  const handleBookAppointment = async () => {
    if (!selectedEvent) return;
    
    try {
      setLoading(true);
      
      const appointmentData = {
        doctorId,
        appointmentDate: selectedEvent.dateStr,
        startTime: selectedEvent.startTime,
        endTime: selectedEvent.endTime,
        symptoms,
        notes
      };
      
      const response = await axios.post('/api/appointments', appointmentData);
      
      // Add the new appointment to the list
      setAppointments([...appointments, response.data]);
      
      // Show success message
      setSuccess('Appointment booked successfully!');
      
      // Close the dialog
      handleCloseDialog();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error booking appointment:', err);
      setError('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && events.length === 0) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        Book an Appointment with Dr. {doctorName}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek'
              }}
              events={events}
              eventClick={handleEventClick}
              height="auto"
              slotMinTime="06:00:00"
              slotMaxTime="22:00:00"
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Booking Information
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">
                Doctor: Dr. {doctorName}
              </Typography>
              <Typography variant="body1">
                Consultation Fee: ₹{doctorFees}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">
                How to book:
              </Typography>
              <Typography variant="body2" component="ol" sx={{ pl: 2 }}>
                <li>Green slots are available for booking</li>
                <li>Red slots are already booked</li>
                <li>Click on a green slot to book an appointment</li>
                <li>Fill in your symptoms and any notes</li>
                <li>Click 'Book Appointment' to confirm</li>
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle1">
                Legend:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 20, height: 20, bgcolor: '#4caf50', mr: 1 }} />
                <Typography variant="body2">Available</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 20, height: 20, bgcolor: '#f44336', mr: 1 }} />
                <Typography variant="body2">Booked</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Booking Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Book Appointment
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Date: {new Date(selectedEvent.dateStr).toLocaleDateString()}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Time: {selectedEvent.startTime} - {selectedEvent.endTime}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Day: {selectedEvent.dayName}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Fee: ₹{doctorFees}
              </Typography>
              
              <TextField
                label="Symptoms"
                multiline
                rows={3}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                fullWidth
                margin="normal"
                placeholder="Describe your symptoms"
              />
              
              <TextField
                label="Additional Notes"
                multiline
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                margin="normal"
                placeholder="Any additional information for the doctor"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleBookAppointment} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Book Appointment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AppointmentBookingCalendar;