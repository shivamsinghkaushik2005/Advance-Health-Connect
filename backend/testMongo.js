import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://singhkaushikshivam:a6dlZhaF76Y5Zvj6@cluster0.4wgy71g.mongodb.net/health-connect';

async function testDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'health-connect' // Explicitly set the database name
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
    
    // Check if we can find users
    const existingUsers = await User.find({}).limit(5);
    console.log(`Found ${existingUsers.length} existing users`);
    if (existingUsers.length > 0) {
      console.log('Sample user:', {
        id: existingUsers[0]._id,
        name: existingUsers[0].name,
        email: existingUsers[0].email,
        userType: existingUsers[0].userType
      });
    }
    
    // Try to create a test user
    const testUserData = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`, // Unique email
      password: 'password123',
      phoneNumber: `9${Math.floor(Math.random() * 900000000) + 100000000}`, // Random 10-digit number
      userType: 'patient'
    };
    
    console.log('Attempting to create test user:', testUserData);
    const user = await User.create(testUserData);
    
    console.log('Test user created successfully:', {
      id: user._id,
      name: user.name,
      email: user.email
    });
    
    // Delete the test user
    await User.deleteOne({ _id: user._id });
    console.log('Test user deleted');
    
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Database test error:', error);
  }
}

testDatabase(); 