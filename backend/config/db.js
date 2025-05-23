import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // MongoDB Connection using either .env variable or hardcoded string (not recommended for production)
    //added
    const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://singhkaushikshivam:a6dlZhaF76Y5Zvj6@cluster0.4wgy71g.mongodb.net/health-connect';
    
    console.log('Connecting to MongoDB...');
    
    const conn = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'health-connect' // Explicitly set the database name
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