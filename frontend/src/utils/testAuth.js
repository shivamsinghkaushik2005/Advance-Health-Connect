import axios from 'axios';

// Test direct registration without going through the React components
export const testRegister = async (userData = null) => {
  try {
    // Default test user if none provided
    const testUserData = userData || {
      name: 'Test Console User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      phoneNumber: `9${Math.floor(Math.random() * 900000000) + 100000000}`,
      userType: 'patient'
    };
    
    console.log('Testing registration with data:', testUserData);
    
    // Using proxy from package.json instead of setting baseURL
    // axios.defaults.baseURL = 'http://localhost:5000';
    
    // Make the request with detailed options
    const response = await axios.post('/api/auth/register', testUserData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 seconds
    });
    
    console.log('Registration successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Registration failed!');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    console.error('Full error:', error);
    throw error;
  }
};

// Expose function to window for easy console testing
if (typeof window !== 'undefined') {
  window.testRegister = testRegister;
}

export default { testRegister }; 