import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Divider,
  LinearProgress,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Slide,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  LocalHospital as PrescriptionIcon,
  Campaign as CampaignIcon,
  Notifications as NotificationIcon,
  AccountCircle as ProfileIcon,
  ArrowForward as ArrowForwardIcon,
  Close as CloseIcon,
  MedicalServices as MedicalServicesIcon,
  Description as DescriptionIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import useAuth from '../hooks/useAuth';
import AppointmentsPage from './AppointmentsPage';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const theme = useTheme();
  const appointmentsRef = useRef(null);

  // State for appointments dialog and counts
  const [appointmentsDialogOpen, setAppointmentsDialogOpen] = useState(false);
  const [medicalHistoryDialogOpen, setMedicalHistoryDialogOpen] = useState(false);
  const [reportsDialogOpen, setReportsDialogOpen] = useState(false);
  const [appointmentCounts, setAppointmentCounts] = useState({
    upcoming: 0,
    prescriptions: 0,
    healthCamps: 0
  });
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch appointment counts and user data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch appointments
        const appointmentsResponse = await axios.get('/api/appointments/patient');
        const appointments = appointmentsResponse.data;
        
        // Count upcoming appointments (scheduled ones)
        const upcomingCount = appointments.filter(app => app.status === 'scheduled').length;
        
        // Count active prescriptions
        const prescriptionCount = appointments.filter(app => 
          app.status === 'completed' && app.prescription
        ).length;

        // Fetch user data for medical history
        const userResponse = await axios.get('/api/auth/profile');
        const userData = userResponse.data;
        
        if (userData.medicalHistory) {
          setMedicalHistory(userData.medicalHistory);
        }
        
        // For demo purposes - sample reports data
        // In a real app, you would fetch this from an API
        setReports([
          { id: 1, name: 'Blood Test Report', date: '2023-10-15', type: 'Blood Test' },
          { id: 2, name: 'X-Ray Report', date: '2023-09-22', type: 'Radiology' },
          { id: 3, name: 'Annual Health Checkup', date: '2023-08-05', type: 'General' }
        ]);

        setAppointmentCounts({
          upcoming: upcomingCount,
          prescriptions: prescriptionCount,
          healthCamps: 5 // This could be fetched from a separate API endpoint if available
        });
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Dummy data for progress (you can replace with real data)
  const healthProgress = 75;

  const handleViewAllAppointments = () => {
    setAppointmentsDialogOpen(true);
  };

  const handleCloseAppointmentsDialog = () => {
    setAppointmentsDialogOpen(false);
  };
  
  const handleViewMedicalHistory = () => {
    setMedicalHistoryDialogOpen(true);
  };

  const handleCloseMedicalHistoryDialog = () => {
    setMedicalHistoryDialogOpen(false);
  };
  
  const handleViewReports = () => {
    setReportsDialogOpen(true);
  };

  const handleCloseReportsDialog = () => {
    setReportsDialogOpen(false);
  };

  const StatCard = ({ icon: Icon, title, value, color, onArrowClick }) => (
    <Card 
      elevation={0}
      sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}30`,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 4px 20px ${color}20`
        }
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Avatar sx={{ bgcolor: `${color}20`, color: color }}>
            <Icon />
          </Avatar>
          <IconButton 
            size="small" 
            sx={{ 
              color: color,
              '&:hover': {
                transform: 'scale(1.1)',
                bgcolor: `${color}20`
              }
            }}
            onClick={onArrowClick}
          >
            <ArrowForwardIcon />
          </IconButton>
        </Box>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box 
        mb={4} 
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}05 100%)`,
          borderRadius: 2,
          p: 3,
          border: `1px solid ${theme.palette.primary.main}30`
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {t('nav.dashboard')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user ? `Welcome back, ${user.name}` : 'Welcome to your dashboard'}
            </Typography>
          </Box>
          <Avatar 
            sx={{ 
              width: 56, 
              height: 56,
              bgcolor: theme.palette.primary.main,
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          >
            <ProfileIcon />
          </Avatar>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={3}>
          <StatCard 
            icon={CalendarIcon}
            title="Upcoming Appointments"
            value={loading ? "..." : appointmentCounts.upcoming}
            color={theme.palette.primary.main}
            onArrowClick={handleViewAllAppointments}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard 
            icon={PrescriptionIcon}
            title="Active Prescriptions"
            value={loading ? "..." : appointmentCounts.prescriptions}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard 
            icon={MedicalServicesIcon}
            title="Medical History"
            value={loading ? "..." : medicalHistory.length}
            color={theme.palette.warning.main}
            onArrowClick={handleViewMedicalHistory}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard 
            icon={DescriptionIcon}
            title="Health Reports"
            value={loading ? "..." : reports.length}
            color={theme.palette.info.main}
            onArrowClick={handleViewReports}
          />
        </Grid>

        {/* Health Progress Section */}
        <Grid item xs={12}>
          <Card 
            elevation={0}
            sx={{ 
              mt: 2,
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Health Progress
                </Typography>
                <IconButton size="small">
                  <NotificationIcon />
                </IconButton>
              </Box>
              <Box mb={1}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Overall Health Score
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={healthProgress} 
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: `${theme.palette.primary.main}20`,
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
                    }
                  }}
                />
                <Box display="flex" justifyContent="space-between" mt={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Progress
                  </Typography>
                  <Typography variant="caption" color="primary">
                    {healthProgress}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Appointments Section */}
        <Grid item xs={12} ref={appointmentsRef}>
          <Paper 
            elevation={0}
            sx={{ 
              mt: 2,
              p: 0,
              background: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <Box p={3} pb={2}>
              <Typography variant="h6" fontWeight="bold">
                Your Appointments
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your upcoming and past appointments
              </Typography>
            </Box>
            <Divider />
            <AppointmentsPage />
          </Paper>
        </Grid>
      </Grid>

      {/* All Appointments Dialog */}
      <Dialog
        open={appointmentsDialogOpen}
        onClose={handleCloseAppointmentsDialog}
        maxWidth="md"
        fullWidth
        TransitionComponent={Transition}
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2
          }}
        >
          <Typography variant="h6">All Appointments</Typography>
          <IconButton
            size="small"
            onClick={handleCloseAppointmentsDialog}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <AppointmentsPage />
        </DialogContent>
      </Dialog>
      
      {/* Medical History Dialog */}
      <Dialog
        open={medicalHistoryDialogOpen}
        onClose={handleCloseMedicalHistoryDialog}
        maxWidth="md"
        fullWidth
        TransitionComponent={Transition}
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.warning.main,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2
          }}
        >
          <Typography variant="h6">Medical History</Typography>
          <IconButton
            size="small"
            onClick={handleCloseMedicalHistoryDialog}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {medicalHistory.length > 0 ? (
            <List>
              {medicalHistory.map((item, index) => (
                <ListItem key={index} divider={index < medicalHistory.length - 1}>
                  <ListItemIcon>
                    <MedicalServicesIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.condition}
                    secondary={
                      <>
                        <Typography variant="body2" component="span" color="text.secondary">
                          Diagnosed: {new Date(item.diagnosedDate).toLocaleDateString()}
                        </Typography>
                        <br />
                        <Typography variant="body2" component="span" color="text.secondary">
                          Medications: {item.medications.join(', ')}
                        </Typography>
                        {item.notes && (
                          <>
                            <br />
                            <Typography variant="body2" component="span" color="text.secondary">
                              Notes: {item.notes}
                            </Typography>
                          </>
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box p={3} textAlign="center">
              <Typography variant="body1" color="text.secondary">
                No medical history records found.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseMedicalHistoryDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Health Reports Dialog */}
      <Dialog
        open={reportsDialogOpen}
        onClose={handleCloseReportsDialog}
        maxWidth="md"
        fullWidth
        TransitionComponent={Transition}
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.info.main,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2
          }}
        >
          <Typography variant="h6">Health Reports</Typography>
          <IconButton
            size="small"
            onClick={handleCloseReportsDialog}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {reports.length > 0 ? (
            <List>
              {reports.map((report) => (
                <ListItem key={report.id} divider>
                  <ListItemIcon>
                    <DescriptionIcon color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary={report.name}
                    secondary={
                      <>
                        <Typography variant="body2" component="span" color="text.secondary">
                          Date: {new Date(report.date).toLocaleDateString()}
                        </Typography>
                        <br />
                        <Typography variant="body2" component="span" color="text.secondary">
                          Type: {report.type}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box p={3} textAlign="center">
              <Typography variant="body1" color="text.secondary">
                No health reports found.
              </Typography>
            </Box>
          )}
          <Box mt={3} textAlign="center">
            <Button 
              component={Link} 
              to="/report-summarizer" 
              variant="contained" 
              color="info"
              startIcon={<UploadIcon />}
            >
              Upload New Report
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseReportsDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;