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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Paper,
  IconButton,
  Chip,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const DoctorAvailabilityCalendar = ({ doctorId }) => {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [events, setEvents] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);

  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];

  // Generate time slots from 00:00 to 23:30 with 30-minute intervals
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        slots.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  useEffect(() => {
    fetchDoctorAvailability();
  }, [doctorId]);

  useEffect(() => {
    // Convert availability to calendar events
    const newEvents = [];
    availability.forEach((dayAvail) => {
      const dayIndex = days.indexOf(dayAvail.day);
      if (dayIndex !== -1) {
        dayAvail.slots.forEach((slot, slotIndex) => {
          // Create events for the next 4 weeks
          for (let week = 0; week < 4; week++) {
            const today = new Date();
            const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
            const daysUntilNext = (dayIndex + 7 - currentDayOfWeek) % 7;
            
            // Calculate the date for this occurrence
            const eventDate = new Date(today);
            eventDate.setDate(today.getDate() + daysUntilNext + (week * 7));
            
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
                dayName: dayAvail.day,
                dayIndex: days.indexOf(dayAvail.day),
                slotIndex: slotIndex
              }
            });
          }
        });
      }
    });
    setEvents(newEvents);
  }, [availability]);

  const fetchDoctorAvailability = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/doctors/availability/${doctorId}`);
      setAvailability(response.data.availability || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching doctor availability:', err);
      setError('Failed to load availability. Please try again.');
      setLoading(false);
    }
  };

  const handleSaveAvailability = async () => {
    try {
      setLoading(true);
      await axios.put(`/api/doctors/availability/${doctorId}`, {
        availability: availability
      });
      setSuccess('Availability saved successfully!');
      setLoading(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving doctor availability:', err);
      setError('Failed to save availability. Please try again.');
      setLoading(false);
    }
  };

  const handleOpenDialog = (day = '') => {
    setSelectedDay(day);
    setStartTime('');
    setEndTime('');
    setEditMode(false);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDay('');
    setStartTime('');
    setEndTime('');
    setEditMode(false);
    setSelectedSlotIndex(null);
    setSelectedDayIndex(null);
  };

  const handleAddSlot = () => {
    if (!selectedDay || !startTime || !endTime) {
      setError('Please fill in all fields');
      return;
    }

    if (startTime >= endTime) {
      setError('End time must be after start time');
      return;
    }

    const newAvailability = [...availability];
    const dayIndex = newAvailability.findIndex(day => day.day === selectedDay);

    if (dayIndex === -1) {
      // Day doesn't exist, add it
      newAvailability.push({
        day: selectedDay,
        slots: [{ startTime, endTime }]
      });
    } else {
      // Day exists, add slot
      if (editMode && selectedSlotIndex !== null) {
        // Edit existing slot
        newAvailability[dayIndex].slots[selectedSlotIndex] = { startTime, endTime };
      } else {
        // Add new slot
        newAvailability[dayIndex].slots.push({ startTime, endTime });
      }
    }

    setAvailability(newAvailability);
    handleCloseDialog();
  };

  const handleDeleteSlot = (dayIndex, slotIndex) => {
    const newAvailability = [...availability];
    newAvailability[dayIndex].slots.splice(slotIndex, 1);
    
    // If no slots left for this day, remove the day
    if (newAvailability[dayIndex].slots.length === 0) {
      newAvailability.splice(dayIndex, 1);
    }
    
    setAvailability(newAvailability);
  };

  const handleEditSlot = (dayIndex, slotIndex) => {
    const day = availability[dayIndex];
    const slot = day.slots[slotIndex];
    
    setSelectedDay(day.day);
    setStartTime(slot.startTime);
    setEndTime(slot.endTime);
    setEditMode(true);
    setSelectedSlotIndex(slotIndex);
    setSelectedDayIndex(dayIndex);
    setOpenDialog(true);
  };

  const handleEventClick = (info) => {
    const { dayIndex, slotIndex } = info.event.extendedProps;
    handleEditSlot(dayIndex, slotIndex);
  };

  const handleDateClick = (info) => {
    const clickedDate = new Date(info.dateStr);
    const dayName = days[clickedDate.getDay()];
    handleOpenDialog(dayName);
  };

  if (loading && availability.length === 0) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        Manage Your Availability
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
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
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
              dateClick={handleDateClick}
              height="auto"
              slotMinTime="06:00:00"
              slotMaxTime="22:00:00"
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Weekly Schedule
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={() => handleOpenDialog()}
              sx={{ mb: 2 }}
            >
              Add Availability
            </Button>
            
            {days.map((day) => {
              const dayAvailability = availability.find(a => a.day === day);
              return (
                <Box key={day} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {day}
                  </Typography>
                  
                  {dayAvailability ? (
                    <Box sx={{ ml: 2 }}>
                      {dayAvailability.slots.map((slot, slotIndex) => (
                        <Box 
                          key={slotIndex} 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mb: 1 
                          }}
                        >
                          <Chip 
                            label={`${slot.startTime} - ${slot.endTime}`}
                            color="primary"
                            sx={{ mr: 1 }}
                          />
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleEditSlot(
                              availability.findIndex(a => a.day === day),
                              slotIndex
                            )}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteSlot(
                              availability.findIndex(a => a.day === day),
                              slotIndex
                            )}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                      No availability set
                    </Typography>
                  )}
                </Box>
              );
            })}
            
            <Button 
              variant="contained" 
              color="success"
              startIcon={<SaveIcon />}
              onClick={handleSaveAvailability}
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Schedule'}
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Add/Edit Slot Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editMode ? 'Edit Availability Slot' : 'Add Availability Slot'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Day</InputLabel>
              <Select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                label="Day"
              >
                {days.map((day) => (
                  <MenuItem key={day} value={day}>
                    {day}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Start Time</InputLabel>
              <Select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                label="Start Time"
              >
                {timeSlots.map((time) => (
                  <MenuItem key={`start-${time}`} value={time}>
                    {time}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>End Time</InputLabel>
              <Select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                label="End Time"
              >
                {timeSlots.map((time) => (
                  <MenuItem key={`end-${time}`} value={time}>
                    {time}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleAddSlot} variant="contained" color="primary">
            {editMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorAvailabilityCalendar;