import mongoose from 'mongoose';
import config from './env.js';

const connectDB = async () => {
  try {
    // MongoDB Connection from config
    const MONGO_URI = config.MONGO_URI;
    
    console.log('Connecting to MongoDB...');
    console.log('MONGO_URI:', MONGO_URI); // Print the actual connection string
    
    // Remove any query parameters that might cause issues
    const cleanURI = MONGO_URI.split('?')[0];
    console.log('Using cleaned MongoDB URI:', cleanURI);
    
    const conn = await mongoose.connect(cleanURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'health-connect', // Explicitly set the database name
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000 // Close sockets after 45 seconds of inactivity
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;