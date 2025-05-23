import express from 'express';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import { doctorImageUpload } from '../utils/uploadConfig.js';

const router = express.Router();

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('userId', 'name email phoneNumber');
    res.json(doctors);
  } catch (err) {
    console.error('Error fetching doctors:', err);
    res.status(500).json({ message: 'Server error while fetching doctors' });
  }
});

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    // First find the user to ensure it's a doctor
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find doctor profile or create one if it doesn't exist
    let doctor = await Doctor.findOne({ userId: req.params.id });
    if (!doctor && user.userType === 'doctor') {
      // Create a new doctor profile
      doctor = new Doctor({
        userId: req.params.id,
        speciality: '',
        licenseNumber: '',
        fees: 0,
        languages: [],
        education: [],
        experience: [],
        availability: []
      });
      await doctor.save();
    }

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Combine user and doctor data
    const doctorData = {
      _id: doctor._id,
      userId: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      userType: user.userType,
      speciality: doctor.speciality,
      licenseNumber: doctor.licenseNumber,
      fees: doctor.fees,
      languages: doctor.languages,
      education: doctor.education,
      experience: doctor.experience,
      availability: doctor.availability,
      image: doctor.image,
      isVerified: doctor.isVerified,
      status: doctor.status
    };

    res.json(doctorData);
  } catch (err) {
    console.error('Error fetching doctor:', err);
    res.status(500).json({ message: 'Server error while fetching doctor details' });
  }
});

// @desc    Create a doctor profile
// @route   POST /api/doctors
// @access  Private
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      speciality,
      licenseNumber,
      education,
      experience,
      fees,
      availability,
      languages,
      image
    } = req.body;
    
    // Check if a doctor profile already exists for this user
    const existingDoctor = await Doctor.findOne({ userId });
    
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor profile already exists for this user' });
    }
    
    const doctor = new Doctor({
      userId,
      speciality,
      licenseNumber,
      education,
      experience,
      fees,
      availability,
      languages,
      image: image || ''
    });
    
    const createdDoctor = await doctor.save();
    res.status(201).json(createdDoctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update doctor profile
// @route   PUT /api/doctors/:id
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if user exists and is a doctor
    const user = await User.findById(req.params.id);
    if (!user || user.userType !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Find or create doctor profile
    let doctor = await Doctor.findOne({ userId: req.params.id });
    if (!doctor) {
      doctor = new Doctor({ userId: req.params.id });
    }

    // Check authorization
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    const {
      speciality,
      licenseNumber,
      fees,
      languages,
      education,
      experience,
      availability
    } = req.body;

    // Update fields
    if (speciality) doctor.speciality = speciality;
    if (licenseNumber) doctor.licenseNumber = licenseNumber;
    if (fees) doctor.fees = fees;
    if (languages) doctor.languages = languages;
    if (education) doctor.education = education;
    if (experience) doctor.experience = experience;
    if (availability) doctor.availability = availability;

    await doctor.save();

    // Return combined user and doctor data
    const doctorData = {
      ...doctor.toObject(),
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      userType: user.userType
    };

    res.json(doctorData);
  } catch (err) {
    console.error('Error updating doctor profile:', err);
    res.status(500).json({ message: 'Server error while updating doctor profile' });
  }
});

// @desc    Verify a doctor
// @route   PUT /api/doctors/:id/verify
// @access  Private/Admin
router.put('/:id/verify', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    
    if (doctor) {
      doctor.isVerified = true;
      doctor.status = 'approved';
      
      const updatedDoctor = await doctor.save();
      res.json(updatedDoctor);
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Upload doctor profile image
// @route   POST /api/doctors/:id/upload-image
// @access  Private
router.post('/:id/upload-image', auth, doctorImageUpload.single('image'), async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Check if user is the owner of the doctor profile
    if (doctor.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this doctor profile' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }

    // Update doctor profile with image path
    const imagePath = `/uploads/doctors/${req.file.filename}`;
    doctor.image = imagePath;
    
    const updatedDoctor = await doctor.save();
    res.json({
      message: 'Image uploaded successfully',
      image: imagePath,
      doctor: updatedDoctor
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router; 