import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Box,
  Chip,
  Rating,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Paper,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import VerifiedIcon from '@mui/icons-material/Verified';
import LanguageIcon from '@mui/icons-material/Language';

const DoctorsPage = () => {
  const { t } = useTranslation();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [specialityFilter, setSpecialityFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/doctors');
        setDoctors(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load doctors. Please try again later.');
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Filter doctors based on search term and speciality
  const filteredDoctors = doctors.filter((doctor) => {
    const nameMatch = doctor.userId?.name?.toLowerCase().includes(search.toLowerCase());
    const specialityMatch = doctor.speciality?.toLowerCase().includes(search.toLowerCase());
    const specialityFilterMatch = specialityFilter ? doctor.speciality === specialityFilter : true;
    
    return (nameMatch || specialityMatch) && specialityFilterMatch;
  });

  // Get unique specialities for filter
  const specialities = [...new Set(doctors.map(doctor => doctor.speciality))];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
        {t('doctors.findDoctors')}
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        {t('doctors.connectWithBest')} - Muzaffarpur, Bihar
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              placeholder={t('doctors.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={5}>
            <FormControl fullWidth>
              <InputLabel id="speciality-filter-label">
                {t('doctors.filterBySpeciality')}
              </InputLabel>
              <Select
                labelId="speciality-filter-label"
                value={specialityFilter}
                onChange={(e) => setSpecialityFilter(e.target.value)}
                label={t('doctors.filterBySpeciality')}
              >
                <MenuItem value="">{t('common.all')}</MenuItem>
                {specialities.map((speciality) => (
                  <MenuItem key={speciality} value={speciality}>
                    {speciality}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button 
              fullWidth 
              variant="outlined" 
              startIcon={<FilterListIcon />}
              onClick={() => {
                setSpecialityFilter('');
                setSearch('');
              }}
            >
              {t('common.reset')}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={8}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 4 }}>
          {error}
        </Alert>
      ) : filteredDoctors.length === 0 ? (
        <Alert severity="info" sx={{ my: 4 }}>
          {t('doctors.noDoctorsFound')}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredDoctors.map((doctor) => (
            <Grid item xs={12} md={6} lg={4} key={doctor._id}>
              <Card elevation={4} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={doctor.image 
                      ? doctor.image 
                      : doctor.userId 
                        ? `https://randomuser.me/api/portraits/${doctor.userId.gender === 'female' ? 'women' : 'men'}/${Math.floor(Math.random() * 70)}.jpg` 
                        : 'https://randomuser.me/api/portraits/men/0.jpg'
                    }
                    alt={doctor.userId?.name || 'Doctor'}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      bgcolor: 'rgba(0, 0, 0, 0.54)',
                      color: 'white',
                      padding: '10px',
                    }}
                  >
                    <Typography variant="h6">{doctor.userId?.name || 'Doctor'}</Typography>
                    <Box display="flex" alignItems="center">
                      <LocalHospitalIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      <Typography variant="body2">
                        {doctor.speciality || 'Specialist'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Box display="flex" alignItems="center">
                      <Rating value={doctor.rating || 0} precision={0.1} readOnly size="small" />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        ({doctor.reviewCount || 0} {t('common.reviews')})
                      </Typography>
                    </Box>
                    
                    {doctor.isVerified && (
                      <Chip 
                        icon={<VerifiedIcon />} 
                        label="Verified" 
                        size="small" 
                        color="success" 
                        variant="outlined"
                      />
                    )}
                  </Box>
                  
                  <Box display="flex" alignItems="center" mb={2}>
                    <LocationOnIcon color="action" sx={{ fontSize: 18, mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      Muzaffarpur, Bihar
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">
                      {t('doctors.consultationFee')}:
                    </Typography>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      ₹{doctor.fees || 0}
                    </Typography>
                  </Box>
                  
                  <Box mt={1} mb={2} display="flex" flexWrap="wrap" gap={0.5}>
                    {(doctor.languages || []).slice(0, 3).map((language) => (
                      <Chip 
                        key={language} 
                        label={language} 
                        size="small" 
                        variant="outlined" 
                        icon={<LanguageIcon sx={{ fontSize: 14 }} />}
                      />
                    ))}
                    {(doctor.languages || []).length > 3 && (
                      <Chip 
                        label={`+${doctor.languages.length - 3}`} 
                        size="small" 
                        variant="outlined" 
                      />
                    )}
                  </Box>
                  
                  <Accordion elevation={0} disableGutters>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="qualification-content"
                      id="qualification-header"
                      sx={{ p: 0, minHeight: 40 }}
                    >
                      <Typography variant="body2" color="primary">
                        Qualifications & Experience
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0, pt: 1 }}>
                      {/* Education */}
                      {doctor.education && doctor.education.length > 0 && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                            <SchoolIcon sx={{ fontSize: 14, mr: 0.5 }} /> Education
                          </Typography>
                          <List dense sx={{ py: 0 }}>
                            {doctor.education.slice(0, 2).map((edu, index) => (
                              <ListItem key={index} sx={{ px: 1, py: 0 }}>
                                <ListItemText 
                                  primary={
                                    <Typography variant="caption" display="block" sx={{ fontWeight: 'medium' }}>
                                      {edu.degree}
                                    </Typography>
                                  }
                                  secondary={
                                    <Typography variant="caption" display="block" color="text.secondary">
                                      {edu.institution}
                                    </Typography>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}
                      
                      {/* Experience */}
                      {doctor.experience && doctor.experience.length > 0 && (
                        <Box mt={1}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                            <WorkIcon sx={{ fontSize: 14, mr: 0.5 }} /> Experience
                          </Typography>
                          <List dense sx={{ py: 0 }}>
                            {doctor.experience.slice(0, 2).map((exp, index) => (
                              <ListItem key={index} sx={{ px: 1, py: 0 }}>
                                <ListItemText 
                                  primary={
                                    <Typography variant="caption" display="block" sx={{ fontWeight: 'medium' }}>
                                      {exp.position}
                                    </Typography>
                                  }
                                  secondary={
                                    <Typography variant="caption" display="block" color="text.secondary">
                                      {exp.hospital} {exp.duration && `(${exp.duration})`}
                                    </Typography>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}
                    </AccordionDetails>
                  </Accordion>
                </CardContent>
                
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button 
                    component={Link}
                    to={`/doctors/${doctor._id}`}
                    variant="contained" 
                    color="primary" 
                    fullWidth
                  >
                    {t('doctors.viewProfile')}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default DoctorsPage; 