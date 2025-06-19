import mongoose from 'mongoose';

const MONGO_URI = 'mongodb+srv://singhkaushikshivam:a6dlZhaF76Y5Zvj6@cluster0.4wgy71g.mongodb.net/health-connect?retryWrites=true&w=majority';

console.log('Testing MongoDB connection...');
console.log('Using MongoDB URI:', MONGO_URI);

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });