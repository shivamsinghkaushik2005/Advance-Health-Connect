import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/env.js';

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No authentication token, authorization denied' });
    }

    // Verify token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
      // Use the JWT secret from config
      const decoded = jwt.verify(token, config.JWT_SECRET);
      
      if (!decoded || !decoded.id) {
        return res.status(401).json({ message: 'Invalid token structure' });
      }

      // Get user from database
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ message: 'Token is valid but user not found' });
      }

      // Add user and token to request
      req.user = user;
      req.token = token;
      next();
    } catch (err) {
      console.error('Token verification error:', err);
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token has expired, please login again' });
      }
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token, please login again' });
      }
      return res.status(401).json({ message: 'Token is not valid' });
    }
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ message: 'Server Error in auth middleware' });
  }
};

export default auth; 