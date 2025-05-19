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

  // Setup axios defaults
  useEffect(() => {
    // axios.defaults.baseURL line removed - using proxy from package.json instead
    
    // Log axios errors for debugging
    axios.interceptors.response.use(
      response => response,
      error => {
        console.log('Axios error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }, []);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        // Check for token in localStorage
        const token = localStorage.getItem('token');
        
        if (token) {
          // Set axios auth header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Get user data
          const response = await axios.get('/api/auth/profile');
          setUser(response.data);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Authentication error', error);
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkLoggedIn();
  }, []);

  // Register user
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Registering user:', userData);
      const response = await axios.post('/api/auth/register', userData);
      
      // Save token to localStorage
      localStorage.setItem('token', response.data.token);
      
      // Set token in state and axios headers
      setIsAuthenticated(true);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      // Set user
      setUser(response.data);
      setLoading(false);
      
      return response.data;
    } catch (error) {
      console.error('Registration error details:', error.response?.data);
      
      // Detailed error handling
      if (error.response) {
        // Server responded with an error
        const errorMessage = error.response.data.message || 'Registration failed';
        setError(errorMessage);
      } else if (error.request) {
        // Request was made but no response
        setError('No response from server. Please check your connection.');
      } else {
        // Something else happened
        setError('Error during registration. Please try again.');
      }
      
      setLoading(false);
      throw error;
    }
  };

  // Login user
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      
      // Save token to localStorage
      localStorage.setItem('token', response.data.token);
      
      // Set token in state and axios headers
      setIsAuthenticated(true);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      // Set user
      setUser(response.data);
      setLoading(false);
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Invalid credentials';
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  // Logout user
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Remove axios auth header
    delete axios.defaults.headers.common['Authorization'];
    
    // Reset states
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Context value
  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    register,
    login,
    logout,
    clearError
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 