import dotenv from 'dotenv';
dotenv.config();

const config = {
  JWT_SECRET: process.env.JWT_SECRET || 'health-connect-super-strong-secret-2025',
  MONGO_URI: process.env.MONGO_URI || 'mongodb+srv://singhkaushikshivam:a6dlZhaF76Y5Zvj6@cluster0.4wgy71g.mongodb.net/health-connect',
  NODE_ENV: process.env.NODE_ENV || 'development',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  PORT: process.env.PORT || 5000,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
};

export default config;

