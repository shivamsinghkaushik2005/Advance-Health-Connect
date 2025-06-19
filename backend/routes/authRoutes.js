import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import config from '../config/env.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// @desc    Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phoneNumber, userType, doctorData } = req.body;

    if (!name || !email || !password || !phoneNumber || !userType) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    if (userType === 'doctor') {
      if (!doctorData?.speciality || !doctorData?.licenseNumber || !doctorData?.fees) {
        return res.status(400).json({ message: 'All doctor information is required' });
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Mongoose will handle hashing with pre-save hook
    const user = new User({
      name,
      email,
      password,
      phoneNumber,
      userType
    });

    const savedUser = await user.save();

    if (savedUser.userType === 'doctor' && doctorData) {
      await Doctor.create({
        userId: savedUser._id,
        speciality: doctorData.speciality,
        licenseNumber: doctorData.licenseNumber,
        fees: doctorData.fees,
        education: doctorData.education || [],
        experience: doctorData.experience || [],
        languages: doctorData.languages || ['English'],
        availability: doctorData.availability || [{
          day: 'Monday',
          slots: [{ startTime: '09:00', endTime: '17:00', isBooked: false }]
        }],
        isVerified: false,
        status: 'pending'
      });
    }

    const token = jwt.sign({ id: savedUser._id }, config.JWT_SECRET, { expiresIn: '24h' });

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
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User does not exist' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: '24h' });

    let doctorData = null;
    if (user.userType === 'doctor') {
      doctorData = await Doctor.findOne({ userId: user._id });

      if (!doctorData) {
        doctorData = await Doctor.create({
          userId: user._id,
          speciality: '',
          licenseNumber: '',
          fees: 0,
          education: [],
          experience: [],
          languages: ['English'],
          availability: [{
            day: 'Monday',
            slots: [{ startTime: '09:00', endTime: '17:00' }]
          }],
          isVerified: false,
          status: 'pending'
        });
      }
    }

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        userType: user.userType,
        ...(doctorData && {
          doctorProfile: {
            _id: doctorData._id,
            speciality: doctorData.speciality,
            licenseNumber: doctorData.licenseNumber,
            fees: doctorData.fees,
            education: doctorData.education,
            experience: doctorData.experience,
            languages: doctorData.languages,
            availability: doctorData.availability,
            isVerified: doctorData.isVerified,
            status: doctorData.status
          }
        })
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

export default router;

