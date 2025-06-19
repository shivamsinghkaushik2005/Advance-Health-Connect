const mongoose = require('mongoose');

// Modified connection string (without retryWrites and w parameters)
const MONGO_URI = 'mongodb+srv://singhkaushikshivam:a6dlZhaF76Y5Zvj6@cluster0.4wgy71g.mongodb.net/health-connect';

console.log('Starting MongoDB connection test with final URI...');
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
  
  // Test database by creating a test document
  const TestModel = mongoose.model('TestConnection', new mongoose.Schema({
    name: String,
    timestamp: { type: Date, default: Date.now }
  }));
  
  return TestModel.create({ name: 'Connection Test' })
    .then(doc => {
      console.log('Test document created successfully:', doc);
      return TestModel.findByIdAndDelete(doc._id);
    })
    .then(() => {
      console.log('Test document deleted successfully');
      process.exit(0);
    });
})
.catch(err => {
  console.error('=== MongoDB Connection Error ===');
  console.error('Error Type:', err.name);
  console.error('Error Message:', err.message);
  console.error('Full Error:', JSON.stringify(err, null, 2));
  process.exit(1);
});