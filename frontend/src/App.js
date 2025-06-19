import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import useAuth from './hooks/useAuth';
import { Box, CircularProgress } from '@mui/material';





// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Chatbot from './components/Chatbot';


// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DoctorsPage from './pages/DoctorsPage';
import DoctorDetailPage from './pages/DoctorDetailPage';
import AppointmentsPage from './pages/AppointmentsPage';
import ProfilePage from './pages/ProfilePage';
import HealthCampsPage from './pages/HealthCampsPage';
import NotFoundPage from './pages/NotFoundPage';
import Dashboard from './pages/Dashboard';
import DoctorDashboardPage from './pages/DoctorDashboardPage';
import UploadReportPage from './pages/UploadReportPage';



// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  console.log('ProtectedRoute Check:', { isAuthenticated, loading });
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Doctor-only route component
const DoctorRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  console.log('DoctorRoute Check:', { isAuthenticated, loading, userType: user?.userType });
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.userType !== 'doctor') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Create Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
      light: '#60a5fa',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f9fafb',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  const { isAuthenticated, user } = useAuth();
  
  console.log('App Render:', { isAuthenticated, userType: user?.userType });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
         <Route path="/report-summarizer" element={<UploadReportPage />} />

          <Route 
            path="/login" 
            element={
              isAuthenticated ? (
                user?.userType === 'doctor' ? (
                  <Navigate to="/doctor-dashboard" replace />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              ) : (
                <LoginPage />
              )
            } 
          />
          <Route 
            path="/register" 
            element={
              isAuthenticated ? (
                user?.userType === 'doctor' ? (
                  <Navigate to="/doctor-dashboard" replace />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              ) : (
                <RegisterPage />
              )
            } 
          />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/doctors/:id" element={<DoctorDetailPage />} />
          <Route path="/health-camps" element={<HealthCampsPage />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                {user?.userType === 'doctor' ? (
                  <Navigate to="/doctor-dashboard" replace />
                ) : (
                  <Dashboard />
                )}
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctor-dashboard" 
            element={
              <DoctorRoute>
                <DoctorDashboardPage />
              </DoctorRoute>
            } 
          />
          <Route 
            path="/appointments" 
            element={
              <ProtectedRoute>
                <AppointmentsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          
          {/* 404 Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <Chatbot />
    </ThemeProvider>
  );
}

export default App; 