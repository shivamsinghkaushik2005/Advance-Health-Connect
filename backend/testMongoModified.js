const mongoose = require('mongoose');

// Original connection string
const ORIGINAL_URI = 'mongodb+srv://singhkaushikshivam:a6dlZhaF76Y5Zvj6@cluster0.4wgy71g.mongodb.net/health-connect?retryWrites=true&w=majority';

// Modified connection string (removing retryWrites and w parameters)
const MODIFIED_URI = 'mongodb+srv://singhkaushikshivam:a6dlZhaF76Y5Zvj6@cluster0.4wgy71g.mongodb.net/health-connect';

console.log('Starting MongoDB connection test with modified URI...');
console.log(`Connecting to: ${MODIFIED_URI}`);

mongoose.connect(MODIFIED_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'health-connect'
})
.then(conn => {
  console.log('=== MongoDB Connection Successful ===');
  console.log(`Connected to: ${conn.connection.host}`);
  console.log(`Database Name: ${conn.connection.name}`);
  console.log('Connection State:', mongoose.connection.readyState);
  process.exit(0);
})
.catch(err => {
  console.error('=== MongoDB Connection Error ===');
  console.error('Error Type:', err.name);
  console.error('Error Message:', err.message);
  console.error('Full Error:', JSON.stringify(err, null, 2));
  process.exit(1);
});