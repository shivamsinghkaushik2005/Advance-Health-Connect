import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Divider,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stepper,
  Step,
  StepLabel,
  Collapse,
  Card,
  CardContent,
  IconButton,
  Chip,
  Stack,
  InputAdornment,
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  MedicalServices as MedicalServicesIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Language as LanguageIcon,
  Schedule as ScheduleIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import useAuth from '../hooks/useAuth';

// Common specialties for selection
const SPECIALTIES = [
  'Cardiologist',
  'Dermatologist',
  'Endocrinologist',
  'Gastroenterologist',
  'General Physician',
  'Gynecologist',
  'Neurologist',
  'Oncologist',
  'Ophthalmologist',
  'Orthopedic',
  'Pediatrician',
  'Psychiatrist',
  'Pulmonologist',
  'Radiologist',
  'Urologist'
];

// Languages spoken
const LANGUAGES = [
  'English',
  'Hindi',
  'Bhojpuri',
  'Bengali',
  'Maithili',
  'Urdu',
  'Punjabi',
  'Tamil',
  'Telugu',
  'Marathi',
  'Gujarati',
  'Kannada',
  'Malayalam',
  'Odia'
];

// Days of the week
const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, error: authError } = useAuth();
  
  const [activeStep, setActiveStep] = useState(0);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    userType: 'patient',
    // Doctor specific fields
    speciality: '',
    licenseNumber: '',
    fees: '',
    education: [{ degree: '', institution: '', year: '' }],
    experience: [{ hospital: '', position: '', duration: '' }],
    languages: ['English'],
    availability: [
      { 
        day: 'Monday', 
        slots: [{ startTime: '09:00', endTime: '17:00', isBooked: false }] 
      }
    ]
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleEducationChange = (index, field, value) => {
    const updatedEducation = formData.education.map((edu, i) => 
      i === index ? { ...edu, [field]: value } : edu
    );
    
    setFormData({
      ...formData,
      education: updatedEducation
    });
  };
  
  const handleExperienceChange = (index, field, value) => {
    const updatedExperience = formData.experience.map((exp, i) => 
      i === index ? { ...exp, [field]: value } : exp
    );
    
    setFormData({
      ...formData,
      experience: updatedExperience
    });
  };
  
  const handleAvailabilityChange = (index, field, value) => {
    const updatedAvailability = formData.availability.map((avail, i) => 
      i === index ? { ...avail, [field]: value } : avail
    );
    
    setFormData({
      ...formData,
      availability: updatedAvailability
    });
  };
  
  const handleSlotChange = (dayIndex, slotIndex, field, value) => {
    const updatedAvailability = [...formData.availability];
    updatedAvailability[dayIndex].slots[slotIndex][field] = value;
    
    setFormData({
      ...formData,
      availability: updatedAvailability
    });
  };
  
  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { degree: '', institution: '', year: '' }]
    });
  };
  
  const removeEducation = (index) => {
    if (formData.education.length > 1) {
      const updatedEducation = formData.education.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        education: updatedEducation
      });
    }
  };
  
  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [...formData.experience, { hospital: '', position: '', duration: '' }]
    });
  };
  
  const removeExperience = (index) => {
    if (formData.experience.length > 1) {
      const updatedExperience = formData.experience.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        experience: updatedExperience
      });
    }
  };
  
  const addDay = () => {
    // Find days not already in the availability
    const existingDays = formData.availability.map(a => a.day);
    const availableDays = DAYS_OF_WEEK.filter(day => !existingDays.includes(day));
    
    if (availableDays.length > 0) {
      setFormData({
        ...formData,
        availability: [
          ...formData.availability, 
          { 
            day: availableDays[0], 
            slots: [{ startTime: '09:00', endTime: '17:00', isBooked: false }] 
          }
        ]
      });
    }
  };
  
  const removeDay = (index) => {
    if (formData.availability.length > 1) {
      const updatedAvailability = formData.availability.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        availability: updatedAvailability
      });
    }
  };
  
  const addSlot = (dayIndex) => {
    const updatedAvailability = [...formData.availability];
    updatedAvailability[dayIndex].slots.push({ startTime: '09:00', endTime: '17:00', isBooked: false });
    
    setFormData({
      ...formData,
      availability: updatedAvailability
    });
  };
  
  const removeSlot = (dayIndex, slotIndex) => {
    if (formData.availability[dayIndex].slots.length > 1) {
      const updatedAvailability = [...formData.availability];
      updatedAvailability[dayIndex].slots = updatedAvailability[dayIndex].slots.filter((_, i) => i !== slotIndex);
      
      setFormData({
        ...formData,
        availability: updatedAvailability
      });
    }
  };
  
  const handleLanguagesChange = (event, newValue) => {
    setFormData({
      ...formData,
      languages: newValue
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.password || !formData.phoneNumber) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    // Validate doctor-specific fields if user type is doctor
    if (formData.userType === 'doctor') {
      if (!formData.speciality) {
        setError("Please select your speciality");
        return;
      }
      if (!formData.licenseNumber) {
        setError("Please enter your license number");
        return;
      }
      if (!formData.fees || formData.fees <= 0) {
        setError("Please enter valid consultation fees");
        return;
      }
      
      // Validate education
      if (!formData.education.some(edu => edu.degree && edu.institution && edu.year)) {
        setError("Please add at least one education record with complete details");
        return;
      }
      
      // Validate experience
      if (!formData.experience.some(exp => exp.hospital && exp.position && exp.duration)) {
        setError("Please add at least one experience record with complete details");
        return;
      }
      
      // Validate languages
      if (!formData.languages || formData.languages.length === 0) {
        setError("Please select at least one language");
        return;
      }
      
      // Validate availability
      if (!formData.availability || formData.availability.length === 0) {
        setError("Please add at least one day of availability");
        return;
      }
    }
    
    setError('');
    setLoading(true);
    setDebugInfo(null);
    
    try {
      // Create the registration data
      const userData = {
        name: formData.name.trim(), 
        email: formData.email.trim(),
        password: formData.password,
        phoneNumber: formData.phoneNumber.trim(),
        userType: formData.userType
      };
      
      // Add doctor-specific data if registering as a doctor
      if (formData.userType === 'doctor') {
        userData.doctorData = {
          speciality: formData.speciality,
          licenseNumber: formData.licenseNumber.trim(),
          fees: parseFloat(formData.fees),
          education: formData.education.filter(edu => edu.degree && edu.institution && edu.year),
          experience: formData.experience.filter(exp => exp.hospital && exp.position && exp.duration),
          languages: formData.languages,
          availability: formData.availability.map(day => ({
            day: day.day,
            slots: day.slots.map(slot => ({
              startTime: slot.startTime,
              endTime: slot.endTime,
              isBooked: false
            }))
          }))
        };
      }
      
      console.log('Sending registration data:', {
        ...userData,
        password: '***HIDDEN***'
      });
      
      // Register the user
      const registeredUser = await register(userData);
      
      // If registration is successful, redirect to dashboard
      navigate('/dashboard');
      
    } catch (err) {
      console.error('Registration error:', err);
      
      // Display the server error message
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Registration failed. Please try again.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Determine if we should show doctor fields
  const isDoctor = formData.userType === 'doctor';
  
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            {t('auth.registerTitle')}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Create your account to access healthcare services
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {authError && !error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {authError}
          </Alert>
        )}
        
        {debugInfo && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="subtitle2">Debug Info:</Typography>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </Alert>
        )}
        
        {isDoctor && (
          <Box mb={4}>
            <Stepper activeStep={activeStep} alternativeLabel>
              <Step>
                <StepLabel>User Information</StepLabel>
              </Step>
              <Step>
                <StepLabel>Professional Details</StepLabel>
              </Step>
              <Step>
                <StepLabel>Education & Experience</StepLabel>
              </Step>
              <Step>
                <StepLabel>Availability</StepLabel>
              </Step>
            </Stepper>
          </Box>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Information (shown for all users) */}
          <Box sx={{ display: isDoctor ? (activeStep === 0 ? 'block' : 'none') : 'block' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={t('auth.name')}
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={t('auth.email')}
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
              </Grid>
          
              <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={t('auth.phoneNumber')}
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />
              </Grid>
          
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
            <InputLabel id="user-type-label">{t('auth.userType')}</InputLabel>
            <Select
              labelId="user-type-label"
              name="userType"
              value={formData.userType}
              label={t('auth.userType')}
              onChange={handleChange}
            >
              <MenuItem value="patient">{t('auth.patient')}</MenuItem>
              <MenuItem value="doctor">{t('auth.doctor')}</MenuItem>
              <MenuItem value="pharmacy">{t('auth.pharmacy')}</MenuItem>
              <MenuItem value="lab">{t('auth.lab')}</MenuItem>
            </Select>
          </FormControl>
              </Grid>
          
              <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={t('auth.password')}
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
              </Grid>
          
              <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={t('auth.confirmPassword')}
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
                />
              </Grid>
            </Grid>
            
            {isDoctor && (
              <Box mt={3} display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                >
                  Next
                </Button>
              </Box>
            )}
          </Box>
          
          {/* Step 2: Professional Details (doctor only) */}
          {isDoctor && (
            <Box sx={{ display: activeStep === 1 ? 'block' : 'none' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Professional Details
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <Autocomplete
                      value={formData.speciality}
                      onChange={(event, newValue) => {
                        setFormData({ ...formData, speciality: newValue });
                      }}
                      options={SPECIALTIES}
                      freeSolo
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          label="Speciality" 
                          required
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <InputAdornment position="start">
                                  <MedicalServicesIcon color="primary" />
                                </InputAdornment>
                                {params.InputProps.startAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="License Number"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    required
                    helperText="Enter your medical license number"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Consultation Fee (₹)"
                    name="fees"
                    type="number"
                    value={formData.fees}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoneyIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    multiple
                    value={formData.languages}
                    onChange={handleLanguagesChange}
                    options={LANGUAGES}
                    freeSolo
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          variant="outlined"
                          label={option}
                          {...getTagProps({ index })}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Languages Spoken"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <InputAdornment position="start">
                                <LanguageIcon color="primary" />
                              </InputAdornment>
                              {params.InputProps.startAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
              
              <Box mt={3} display="flex" justifyContent="space-between">
                <Button onClick={handleBack}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}
          
          {/* Step 3: Education & Experience (doctor only) */}
          {isDoctor && (
            <Box sx={{ display: activeStep === 2 ? 'block' : 'none' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Education
              </Typography>
              
              {formData.education.map((edu, index) => (
                <Card key={`edu-${index}`} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={5}>
                        <TextField
                          fullWidth
                          label="Degree"
                          value={edu.degree}
                          onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SchoolIcon color="primary" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={5}>
                        <TextField
                          fullWidth
                          label="Institution"
                          value={edu.institution}
                          onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                          required
                        />
                      </Grid>
                      
                      <Grid item xs={10} md={1}>
                        <TextField
                          fullWidth
                          label="Year"
                          type="number"
                          value={edu.year}
                          onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                          required
                        />
                      </Grid>
                      
                      <Grid item xs={2} md={1} display="flex" alignItems="center">
                        <IconButton 
                          color="error" 
                          onClick={() => removeEducation(index)}
                          disabled={formData.education.length <= 1}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
              
              <Box mb={3}>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addEducation}
                  variant="outlined"
                >
                  Add Education
                </Button>
              </Box>
              
              <Typography variant="h6" color="primary" gutterBottom>
                Experience
              </Typography>
              
              {formData.experience.map((exp, index) => (
                <Card key={`exp-${index}`} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Hospital/Clinic"
                          value={exp.hospital}
                          onChange={(e) => handleExperienceChange(index, 'hospital', e.target.value)}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <WorkIcon color="primary" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Position"
                          value={exp.position}
                          onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                          required
                        />
                      </Grid>
                      
                      <Grid item xs={10} md={3}>
                        <TextField
                          fullWidth
                          label="Duration (e.g., 2018-2022)"
                          value={exp.duration}
                          onChange={(e) => handleExperienceChange(index, 'duration', e.target.value)}
                          required
                        />
                      </Grid>
                      
                      <Grid item xs={2} md={1} display="flex" alignItems="center">
                        <IconButton 
                          color="error" 
                          onClick={() => removeExperience(index)}
                          disabled={formData.experience.length <= 1}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
              
              <Box mb={3}>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addExperience}
                  variant="outlined"
                >
                  Add Experience
                </Button>
              </Box>
              
              <Box mt={3} display="flex" justifyContent="space-between">
                <Button onClick={handleBack}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}
          
          {/* Step 4: Availability (doctor only) */}
          {isDoctor && (
            <Box sx={{ display: activeStep === 3 ? 'block' : 'none' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Availability
              </Typography>
              
              {formData.availability.map((dayAvail, dayIndex) => (
                <Card key={`day-${dayIndex}`} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                          <InputLabel>Day</InputLabel>
                          <Select
                            value={dayAvail.day}
                            label="Day"
                            onChange={(e) => handleAvailabilityChange(dayIndex, 'day', e.target.value)}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <ScheduleIcon color="primary" />
                                </InputAdornment>
                              ),
                            }}
                          >
                            {DAYS_OF_WEEK.map((day) => (
                              <MenuItem 
                                key={day} 
                                value={day}
                                disabled={formData.availability.some(
                                  (a, i) => i !== dayIndex && a.day === day
                                )}
                              >
                                {day}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={10} md={8}>
                        <Typography variant="subtitle2" gutterBottom>
                          Time Slots:
                        </Typography>
                        
                        {dayAvail.slots.map((slot, slotIndex) => (
                          <Box key={`slot-${dayIndex}-${slotIndex}`} sx={{ mb: 2, display: 'flex', gap: 2 }}>
                            <TextField
                              label="Start Time"
                              type="time"
                              value={slot.startTime}
                              onChange={(e) => handleSlotChange(dayIndex, slotIndex, 'startTime', e.target.value)}
                              InputLabelProps={{ shrink: true }}
                              inputProps={{ step: 300 }}
                              sx={{ width: '120px' }}
                            />
                            
                            <TextField
                              label="End Time"
                              type="time"
                              value={slot.endTime}
                              onChange={(e) => handleSlotChange(dayIndex, slotIndex, 'endTime', e.target.value)}
                              InputLabelProps={{ shrink: true }}
                              inputProps={{ step: 300 }}
                              sx={{ width: '120px' }}
                            />
                            
                            <IconButton 
                              color="error" 
                              onClick={() => removeSlot(dayIndex, slotIndex)}
                              disabled={dayAvail.slots.length <= 1}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        ))}
                        
                        <Button
                          startIcon={<AddIcon />}
                          onClick={() => addSlot(dayIndex)}
                          size="small"
                        >
                          Add Slot
                        </Button>
                      </Grid>
                      
                      <Grid item xs={2} md={1} display="flex" alignItems="flex-start">
                        <IconButton 
                          color="error" 
                          onClick={() => removeDay(dayIndex)}
                          disabled={formData.availability.length <= 1}
                          sx={{ mt: 3 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
              
              <Box mb={3}>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addDay}
                  variant="outlined"
                  disabled={formData.availability.length >= 7}
                >
                  Add Day
                </Button>
              </Box>
              
              <Box mt={3} display="flex" justifyContent="space-between">
                <Button onClick={handleBack}>
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? t('common.loading') : t('auth.registerButton')}
                </Button>
              </Box>
            </Box>
          )}
          
          {/* Submit button for non-doctor users */}
          {!isDoctor && (
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? t('common.loading') : t('auth.registerButton')}
          </Button>
          )}
        </form>
        
        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>
        
        <Grid container justifyContent="center">
          <Grid item>
            <Typography variant="body2">
              {t('auth.haveAccount')}{' '}
              <Link to="/login" style={{ color: 'primary' }}>
                {t('auth.loginHere')}
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default RegisterPage; 