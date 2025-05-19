import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import config from '../config/env.js';

const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    // Log the request body for debugging
    console.log('Register request body:', req.body);
    
    const { name, email, password, phoneNumber, userType } = req.body;

    // Log the extracted fields
    console.log('Extracted fields:', { name, email, phoneNumber, userType });

    // Validate required fields
    if (!name || !email || !password || !phoneNumber) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists by email
    const userExistsByEmail = await User.findOne({ email });
    if (userExistsByEmail) {
      console.log('User already exists with email:', email);
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Check if user exists by phone number
    const userExistsByPhone = await User.findOne({ phoneNumber });
    if (userExistsByPhone) {
      console.log('User already exists with phone number:', phoneNumber);
      return res.status(400).json({ message: 'User with this phone number already exists' });
    }

    // Create new user
    console.log('Creating new user...');
    const user = await User.create({
      name,
      email,
      password,
      phoneNumber,
      userType: userType || 'patient'
    });

    console.log('User created successfully:', user._id);

    // Create doctor profile if user type is doctor
    if (user && user.userType === 'doctor') {
      try {
        // Check if we have doctor data in the request
        const doctorData = req.body.doctorData;
        
        // If there's no doctor data, we'll just create a placeholder doctor profile
        // This will be updated later when the doctor completes their profile
        await Doctor.create({
          userId: user._id,
          speciality: doctorData?.speciality || 'General Physician',
          licenseNumber: doctorData?.licenseNumber || `temp-${Date.now()}`,
          education: doctorData?.education || [],
          experience: doctorData?.experience || [],
          fees: doctorData?.fees || 500,
          availability: doctorData?.availability || [
            {
              day: 'Monday',
              slots: [
                {
                  startTime: '09:00',
                  endTime: '17:00',
                  isBooked: false
                }
              ]
            }
          ],
          languages: doctorData?.languages || ['English'],
          isVerified: false,
          status: 'pending'
        });
        
        console.log('Doctor profile created for user:', user._id);
      } catch (doctorError) {
        console.error('Error creating doctor profile:', doctorError);
        // We won't fail the registration if doctor profile creation fails
        // The doctor can create/update their profile later
      }
    }

    if (user) {
      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, userType: user.userType }, 
        config.JWT_SECRET, 
        { expiresIn: '30d' }
      );

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        userType: user.userType,
        token: token
      });
    } else {
      console.log('Failed to create user');
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    
    // Check for duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `A user with this ${field} already exists`,
        field: field
      });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, userType: user.userType }, 
        config.JWT_SECRET, 
        { expiresIn: '30d' }
      );

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        userType: user.userType,
        token: token
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', async (req, res) => {
  try {
    // Here you would typically use a middleware to verify the token
    // and attach the user to the request object
    // For simplicity, we'll extract the token manually

    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(
        token, 
        config.JWT_SECRET
      );
      
      // Get user from the token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(
        token, 
        config.JWT_SECRET
      );
      
      // Get user from the token
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Update user fields
      user.name = req.body.name || user.name;
      // Email cannot be changed for security reasons
      user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
      user.gender = req.body.gender || user.gender;
      
      // Save updated user
      const updatedUser = await user.save();
      
      // Return user without password
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        userType: updatedUser.userType,
        gender: updatedUser.gender
      });
      
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 