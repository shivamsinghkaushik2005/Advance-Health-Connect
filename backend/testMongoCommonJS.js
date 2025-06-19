const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://singhkaushikshivam:a6dlZhaF76Y5Zvj6@cluster0.4wgy71g.mongodb.net/health-connect?retryWrites=true&w=majority';

console.log('Starting MongoDB connection test...');
console.log(`Connecting to: ${MONGO_URI}`);

mongoose.connect(MONGO_URI, {
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