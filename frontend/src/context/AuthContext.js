import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create AuthContext
export const AuthContext = createContext();

// Create Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Setup axios defaults and interceptors
  useEffect(() => {
    // Add request interceptor for all requests
    const requestInterceptor = axios.interceptors.request.use(
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
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptors
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        // Set default axios auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Verify token and get user data
        const response = await axios.get('/api/auth/profile');
        if (response.data && response.data.user) {
          const userData = response.data.user;
          
          // If user is a doctor, get doctor profile
          if (userData.userType === 'doctor') {
            try {
              const doctorResponse = await axios.get(`/api/doctors/${userData._id}`);
              if (doctorResponse.data) {
                userData.doctorProfile = doctorResponse.data;
                localStorage.setItem('doctorProfile', JSON.stringify(doctorResponse.data));
              }
            } catch (doctorError) {
              console.error('Error fetching doctor profile:', doctorError);
            }
          }
          
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // Clear invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('doctorProfile');
          delete axios.defaults.headers.common['Authorization'];
        }
      } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('doctorProfile');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkLoggedIn();
  }, []);

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('/api/auth/login', { email, password });
      
      if (!response.data?.token || !response.data?.user) {
        throw new Error('Invalid response data');
      }

      const userData = response.data.user;

      // If user is a doctor, get doctor profile
      if (userData.userType === 'doctor') {
        try {
          const doctorResponse = await axios.get(`/api/doctors/${userData._id}`);
          if (doctorResponse.data) {
            userData.doctorProfile = doctorResponse.data;
            localStorage.setItem('doctorProfile', JSON.stringify(doctorResponse.data));
          }
        } catch (doctorError) {
          console.error('Error fetching doctor profile:', doctorError);
        }
      }

      // Save token to localStorage and set default axios auth header
      localStorage.setItem('token', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      // Set user data and auth state
      setUser(userData);
      setIsAuthenticated(true);
      
      // Return the response data for the login page to use
      return {
        token: response.data.token,
        user: userData
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Invalid credentials';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('doctorProfile');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      // Ensure we're sending the complete data for doctor registration
      const requestData = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phoneNumber: userData.phoneNumber,
        userType: userData.userType
      };

      // Add doctor-specific data if registering as a doctor
      if (userData.userType === 'doctor' && userData.doctorData) {
        requestData.doctorData = {
          speciality: userData.doctorData.speciality,
          licenseNumber: userData.doctorData.licenseNumber,
          fees: parseFloat(userData.doctorData.fees),
          education: userData.doctorData.education || [],
          experience: userData.doctorData.experience || [],
          languages: userData.doctorData.languages || ['English'],
          availability: userData.doctorData.availability || []
        };
      }

      const response = await axios.post('/api/auth/register', requestData);
      
      if (!response.data?.token || !response.data?.user) {
        throw new Error('Invalid response data');
      }

      // Save token and set default axios auth header
      localStorage.setItem('token', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      // Set user data and auth state
      setUser(response.data.user);
      setIsAuthenticated(true);
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      error,
      login,
      logout,
      register,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 