import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_URL = 'http://localhost:5000'; // Adjust if different

// Test user data
const testUser = {
  name: 'Test User',
  email: `test${Date.now()}@example.com`, // Unique email
  password: 'password123',
  phoneNumber: `9${Math.floor(Math.random() * 900000000) + 100000000}`, // Random 10-digit number
  userType: 'patient'
};

async function testRegistration() {
  console.log('Testing registration with data:', testUser);
  
  try {
    // Set request timeout to ensure we get a response or error
    const response = await axios.post(`${API_URL}/api/auth/register`, testUser, {
      timeout: 10000, // 10 seconds
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Registration successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Registration failed!');
    
    if (error.response) {
      // The server responded with an error status
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response received
      console.error('No response received, request:', error.request);
    } else {
      // Error in setting up the request
      console.error('Error setting up request:', error.message);
    }
    
    // Log the full error for debugging
    console.error('Full error:', error);
  }
}

// Run the test
testRegistration(); 