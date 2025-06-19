import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.defaults.baseURL = 'http://localhost:5000';

    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get('/api/auth/profile');

        if (response.data && response.data.user) {
          const userData = response.data.user;

          // ✅ Safely fetch doctor profile only if user is doctor
          if (userData.userType === 'doctor') {
            try {
              const doctorResponse = await axios.get(`/api/doctors/profile/${userData._id}`);
              if (doctorResponse.data) {
                userData.doctorProfile = doctorResponse.data;
                localStorage.setItem('doctorProfile', JSON.stringify(doctorResponse.data));
              }
            } catch (doctorError) {
              console.warn('Doctor profile fetch failed:', doctorError?.response?.data || doctorError.message);
            }
          }

          setUser(userData);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('doctorProfile');
          delete axios.defaults.headers.common['Authorization'];
        }
      } catch (error) {
        console.error('Auth check failed:', error);
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

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      localStorage.removeItem('token');
      localStorage.removeItem('doctorProfile');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);

      const response = await axios.post('/api/auth/login', { email, password });

      if (!response.data?.token || !response.data?.user) {
        throw new Error('Invalid response data');
      }

      const userData = response.data.user;
      localStorage.setItem('token', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      setUser(userData);
      setIsAuthenticated(true);

      // ✅ Prevent login break even if doctor profile fetch fails
      if (userData.userType === 'doctor') {
        try {
          const doctorResponse = await axios.get(`/api/doctors/profile/${userData._id}`);
          if (doctorResponse.data) {
            userData.doctorProfile = doctorResponse.data;
            localStorage.setItem('doctorProfile', JSON.stringify(doctorResponse.data));
          }
        } catch (doctorError) {
          console.warn('Doctor profile fetch failed:', doctorError?.response?.data || doctorError.message);
        }
      }

      return {
        token: response.data.token,
        user: userData
      };
    } catch (error) {
      console.error('Login error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('doctorProfile');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);

      let errorMessage = 'Login failed. Please try again.';
      if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Invalid credentials';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid credentials. Please check your email and password.';
      } else if (error.response?.status === 404) {
        errorMessage = 'User not found.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('doctorProfile');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const requestData = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phoneNumber: userData.phoneNumber,
        userType: userData.userType
      };

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

      localStorage.setItem('token', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
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
