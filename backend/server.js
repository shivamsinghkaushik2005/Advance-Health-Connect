import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { protect } from './middlewares/authMiddleware.js';

// Import database connection
import connectDB from './config/db.js';
import config from './config/env.js';

// Import Socket.IO server setup
import setupSocketServer from './socketServer.js';

// ES module dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config();

// Create Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO server
const io = setupSocketServer(server);

// Middleware
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Serve uploaded files as static content
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
connectDB();

// Import Routes
import userRoutes from './routes/userRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import authRoutes from './routes/authRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import healthCampRoutes from './routes/healthCampRoutes.js';

// Use Routes
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/appointments', protect, appointmentRoutes);
app.use('/api/chat', protect, chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', protect, paymentRoutes);
app.use('/api/health-camps', healthCampRoutes);

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    message: 'Server is healthy',
    version: '1.1.0',
    features: [
      'User authentication',
      'Doctor profiles',
      'Appointment booking',
      'Real-time chat',
      'Notifications'
    ]
  });
});

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Health Connect API',
    version: '1.1.0',
    apiDocs: '/api/docs'
  });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
  });
}

// Port
const PORT = config.PORT;

// Error handling for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Start server with Socket.IO
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO server initialized`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
}); 