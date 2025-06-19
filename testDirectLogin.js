const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Create a log file in the same directory as this script
const logFile = path.join(__dirname, 'direct_login_test.txt');
const logStream = fs.createWriteStream(logFile, { flags: 'w' });

// Function to log to both console and file
function log(message) {
  const formattedMessage = typeof message === 'object' 
    ? JSON.stringify(message, null, 2) 
    : message;
  
  console.log(formattedMessage);
  logStream.write(formattedMessage + '\n');
}

// Test credentials
const testCredentials = {
  email: 'bittu@gmail.com',  // Replace with a known user email
  password: 'password123'     // Replace with the known password
};

async function testDirectLogin() {
  log('Starting direct login test at ' + new Date().toISOString());
  log('Test file location: ' + logFile);
  log('Testing login with credentials:');
  log({
    email: testCredentials.email,
    password: '***' // Masked for security
  });
  
  try {
    log('Making login request to http://localhost:5000/api/auth/login');
    
    // Make the login request
    const response = await axios.post('http://localhost:5000/api/auth/login', testCredentials, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });
    
    log('Login successful!');
    log('Response status: ' + response.status);
    log('User data:');
    log({
      _id: response.data.user._id,
      name: response.data.user.name,
      email: response.data.user.email,
      userType: response.data.user.userType
    });
    log('Token received: ' + (response.data.token ? 'Yes' : 'No'));
    
    return response.data;
  } catch (error) {
    log('Login failed!');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      log('Response status: ' + error.response.status);
      log('Response data:');
      log(error.response.data);
      log('Response headers:');
      log(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      log('No response received. Server might be down or unreachable.');
      log('Error request details:');
      log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      log('Error setting up request: ' + error.message);
    }
    
    log('Full error:');
    log(error.toString());
    
    return null;
  }
}

// Execute the test
testDirectLogin()
  .then(result => {
    if (result) {
      log('Test completed successfully');
    } else {
      log('Test failed');
    }
    logStream.end();
    log('Test results written to ' + logFile);
  })
  .catch(err => {
    log('Unexpected error during test: ' + err.message);
    log('Error stack: ' + err.stack);
    logStream.end();
  });