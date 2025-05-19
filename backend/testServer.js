import axios from 'axios';

// Test the server health endpoint
const testServer = async () => {
  try {
    console.log('Testing server connection...');
    const response = await axios.get('http://localhost:5000/api/health');
    console.log('Server is accessible!');
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Server connection failed:');
    if (error.response) {
      console.error('Server response:', error.response.data);
      console.error('Status code:', error.response.status);
    } else if (error.request) {
      console.error('No response received from server');
      console.error('Server might not be running or accessible');
    } else {
      console.error('Error message:', error.message);
    }
  }
};

testServer(); 