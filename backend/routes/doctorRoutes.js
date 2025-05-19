import express from 'express';
import Doctor from '../models/Doctor.js';
import { doctorImageUpload } from '../utils/uploadConfig.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Allow filtering by speciality, language, availability, userId
    const filters = {};
    
    if (req.query.speciality) {
      filters.speciality = req.query.speciality;
    }
    
    if (req.query.isVerified) {
      filters.isVerified = req.query.isVerified === 'true';
    }
    
    if (req.query.userId) {
      filters.userId = req.query.userId;
    }
    
    const doctors = await Doctor.find(filters)
      .populate('userId', 'name phoneNumber email profileImage')
      .sort({ rating: -1 });
      
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'name phoneNumber email profileImage');
    
    if (doctor) {
      res.json(doctor);
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
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
router.put('/:id', protect, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    
    if (doctor) {
      // Verify user is authorized to update this doctor profile
      if (doctor.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this doctor profile' });
      }
      
      doctor.speciality = req.body.speciality || doctor.speciality;
      doctor.licenseNumber = req.body.licenseNumber || doctor.licenseNumber;
      doctor.education = req.body.education || doctor.education;
      doctor.experience = req.body.experience || doctor.experience;
      doctor.fees = req.body.fees || doctor.fees;
      doctor.availability = req.body.availability || doctor.availability;
      doctor.languages = req.body.languages || doctor.languages;
      // Only update image if provided in the request
      if (req.body.image) {
        doctor.image = req.body.image;
      }
      
      const updatedDoctor = await doctor.save();
      res.json(updatedDoctor);
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
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
router.post('/:id/upload-image', protect, doctorImageUpload.single('image'), async (req, res) => {
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