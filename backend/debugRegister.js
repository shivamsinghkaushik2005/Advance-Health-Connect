import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_URL = 'http://localhost:5000';

// The exact user data from the form
const userData = {
  name: 'kalu',
  email: 'kalu@gmail.com',
  password: 'password123', // Replace with the actual password
  phoneNumber: '7878677787',
  userType: 'patient'
};

async function debugRegistration() {
  console.log('Debugging registration with data:', userData);
  
  try {
    // Make the request directly to the backend
    const response = await axios.post(`${API_URL}/api/auth/register`, userData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('Registration successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
  } catch (error) {
    console.error('Registration failed!');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      
      // Specific handling for known error types
      if (error.response.status === 400) {
        console.log('\nPOSSIBLE SOLUTION:');
        if (error.response.data.message.includes('email')) {
          console.log('Email already exists. Try a different email address.');
        } else if (error.response.data.message.includes('phone')) {
          console.log('Phone number already exists. Try a different phone number.');
        } else {
          console.log('Validation error:', error.response.data.message);
        }
      }
    } else if (error.request) {
      console.error('No response received. Is the server running?');
    } else {
      console.error('Error setting up request:', error.message);
    }
  }
}

// Run the debug
debugRegistration(); 