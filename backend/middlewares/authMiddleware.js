import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/env.js';

// Middleware to protect routes - checks for valid JWT token
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, config.JWT_SECRET);

      // Get user from the token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
    return;
  }
};

// Middleware for role-based authorization - more flexible than individual role middlewares
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({ 
        message: `User type ${req.user.userType} is not authorized to access this resource` 
      });
    }
    
    next();
  };
};

// Middleware to restrict routes to admin only (for backward compatibility)
const admin = (req, res, next) => {
  if (req.user && req.user.userType === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

// Middleware to restrict routes to doctors only (for backward compatibility)
const doctor = (req, res, next) => {
  if (req.user && req.user.userType === 'doctor') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a doctor' });
  }
};

export { protect, authorize, admin, doctor }; 