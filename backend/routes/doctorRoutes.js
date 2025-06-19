import express from 'express';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import { protect } from '../middlewares/authMiddleware.js';
import { doctorImageUpload } from '../utils/uploadConfig.js';

const router = express.Router();

// @desc    Get doctor profile by userId
// @route   GET /api/doctors/profile/:userId
// @access  Private
router.get('/profile/:userId', protect, async (req, res) => {
  try {
    console.log('Debug - Finding doctor profile for userId:', req.params.userId);
    
    let doctorProfile = await Doctor.findOne({ userId: req.params.userId })
      .populate('userId', 'name email phoneNumber gender userType');
    
    // If no profile exists, create a default one
    if (!doctorProfile) {
      console.log('Debug - Creating default doctor profile for userId:', req.params.userId);
      
      // First verify this is actually a doctor user
      const user = await User.findById(req.params.userId);
      if (!user || user.userType !== 'doctor') {
        return res.status(404).json({ message: 'User is not a doctor' });
      }
      
      // Create default profile
      doctorProfile = await Doctor.create({
        userId: req.params.userId,
        speciality: '',
        licenseNumber: '',
        fees: 0,
        education: [],
        experience: [],
        languages: ['English'],
        availability: [{
          day: 'Monday',
          slots: [{
            startTime: '09:00',
            endTime: '17:00'
          }]
        }],
        isVerified: false,
        status: 'pending'
      });
      
      // Populate user data
      doctorProfile = await Doctor.findById(doctorProfile._id)
        .populate('userId', 'name email phoneNumber gender userType');
    }
    
    // Format the response to match what the frontend expects
    const formattedProfile = {
      _id: doctorProfile._id,
      userId: doctorProfile.userId,
      name: doctorProfile.userId.name,
      email: doctorProfile.userId.email,
      phoneNumber: doctorProfile.userId.phoneNumber,
      gender: doctorProfile.userId.gender,
      userType: doctorProfile.userId.userType,
      speciality: doctorProfile.speciality,
      licenseNumber: doctorProfile.licenseNumber,
      fees: doctorProfile.fees,
      languages: doctorProfile.languages || [],
      education: doctorProfile.education || [],
      experience: doctorProfile.experience || [],
      availability: doctorProfile.availability || [],
      image: doctorProfile.image,
      isVerified: doctorProfile.isVerified,
      status: doctorProfile.status
    };
    
    console.log('Debug - Sending formatted doctor profile:', formattedProfile);
    res.json(formattedProfile);
  } catch (err) {
    console.error('Debug - Error finding/creating doctor profile:', err);
    res.status(500).json({ 
      message: 'Server error while fetching doctor profile',
      error: err.message 
    });
  }
});

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('userId', 'name email phoneNumber gender')
      .select('speciality fees education experience languages availability image isVerified status');
      
    // Format the response to include all necessary information
    const formattedDoctors = doctors.map(doctor => ({
      _id: doctor._id,
      userId: doctor.userId,
      name: doctor.userId?.name,
      email: doctor.userId?.email,
      phoneNumber: doctor.userId?.phoneNumber,
      gender: doctor.userId?.gender,
      speciality: doctor.speciality,
      fees: doctor.fees,
      education: doctor.education,
      experience: doctor.experience,
      languages: doctor.languages,
      availability: doctor.availability,
      image: doctor.image,
      isVerified: doctor.isVerified,
      status: doctor.status
    }));

    res.json(formattedDoctors);
  } catch (err) {
    console.error('Error fetching doctors:', err);
    res.status(500).json({ message: 'Server error while fetching doctors' });
  }
});

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    // Find doctor profile directly using the doctor's ID
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'name email phoneNumber gender userType');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Combine user and doctor data
    const doctorData = {
      _id: doctor._id,
      userId: doctor.userId._id,
      name: doctor.userId.name,
      email: doctor.userId.email,
      phoneNumber: doctor.userId.phoneNumber,
      gender: doctor.userId.gender,
      userType: doctor.userId.userType,
      speciality: doctor.speciality,
      licenseNumber: doctor.licenseNumber,
      fees: doctor.fees,
      languages: doctor.languages || [],
      education: doctor.education || [],
      experience: doctor.experience || [],
      availability: doctor.availability || [],
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
router.put('/:id', protect, async (req, res) => {
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