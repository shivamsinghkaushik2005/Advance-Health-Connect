import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import config from '../config/env.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phoneNumber, userType, doctorData } = req.body;

    // Validate input
    if (!name || !email || !password || !phoneNumber || !userType) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Additional validation for doctor registration
    if (userType === 'doctor') {
      if (!doctorData || !doctorData.speciality || !doctorData.licenseNumber || !doctorData.fees) {
        return res.status(400).json({ message: 'All doctor information is required' });
      }
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create salt & hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      userType
    });

    const savedUser = await user.save();

    // Create doctor profile if user type is doctor
    if (savedUser && savedUser.userType === 'doctor' && doctorData) {
      try {
        await Doctor.create({
          userId: savedUser._id,
          speciality: doctorData.speciality,
          licenseNumber: doctorData.licenseNumber,
          fees: doctorData.fees,
          education: doctorData.education || [],
          experience: doctorData.experience || [],
          languages: doctorData.languages || ['English'],
          availability: doctorData.availability || [
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
          isVerified: false,
          status: 'pending'
        });
      } catch (doctorError) {
        // If doctor profile creation fails, delete the user and throw error
        await User.findByIdAndDelete(savedUser._id);
        throw new Error('Failed to create doctor profile: ' + doctorError.message);
      }
    }

    // Create token
    const token = jwt.sign(
      { id: savedUser._id },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    // Send response
    res.status(201).json({
      token,
      user: {
        _id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        phoneNumber: savedUser.phoneNumber,
        userType: savedUser.userType
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Check for existing user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User does not exist' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id },
      config.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send response
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        userType: user.userType
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @desc    Get user data
// @route   GET /api/auth/user
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Server error while fetching user data' });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', async (req, res) => {
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
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Return user data wrapped in a user object
      res.json({ user });
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
        config.jwtSecret
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