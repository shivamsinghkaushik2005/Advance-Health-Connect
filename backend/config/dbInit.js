import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Function to initialize the database
const initializeDB = async () => {
  try {
    // Get MongoDB URI from environment or use default
    const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://singhkaushikshivam:a6dlZhaF76Y5Zvj6@cluster0.4wgy71g.mongodb.net/health-connect';
    
    console.log('Connecting to MongoDB...');
    console.log(`URI: ${MONGO_URI}`);
    
    // Connect to MongoDB with explicit database name
    const conn = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'health-connect' // Explicitly set the database name
    });
    
    console.log(`MongoDB Connected to: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
    
    // List all collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('Available collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    console.log('Database initialization completed successfully');
    
  } catch (error) {
    console.error(`Error initializing database: ${error.message}`);
    process.exit(1);
  }
};

// Run the initialization
initializeDB(); 