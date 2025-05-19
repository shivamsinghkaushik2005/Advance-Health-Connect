import express from 'express';
import HealthCamp from '../models/HealthCamp.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// @desc    Get all health camps
// @route   GET /api/health-camps
// @access  Public
router.get('/', async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? {
          $or: [
            { name: { $regex: req.query.keyword, $options: 'i' } },
            { description: { $regex: req.query.keyword, $options: 'i' } },
            { 'location.city': { $regex: req.query.keyword, $options: 'i' } },
            { specialties: { $regex: req.query.keyword, $options: 'i' } }
          ]
        }
      : {};

    const status = req.query.status ? { status: req.query.status } : {};
    
    const healthCamps = await HealthCamp.find({ ...keyword, ...status })
      .sort({ startDate: 1 });
    
    res.json(healthCamps);
  } catch (error) {
    console.error('Error fetching health camps:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single health camp by ID
// @route   GET /api/health-camps/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const healthCamp = await HealthCamp.findById(req.params.id)
      .populate('doctors', 'name speciality fees profileImage rating');
    
    if (!healthCamp) {
      return res.status(404).json({ message: 'Health camp not found' });
    }
    
    res.json(healthCamp);
  } catch (error) {
    console.error('Error fetching health camp:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Register for a health camp
// @route   POST /api/health-camps/:id/register
// @access  Private
router.post('/:id/register', protect, async (req, res) => {
  try {
    const healthCamp = await HealthCamp.findById(req.params.id);
    
    if (!healthCamp) {
      return res.status(404).json({ message: 'Health camp not found' });
    }
    
    // Check if camp is full
    if (healthCamp.currentRegistrations >= healthCamp.maxParticipants) {
      return res.status(400).json({ message: 'This health camp is already full' });
    }
    
    // Check if camp registration is closed
    if (!healthCamp.registrationRequired || healthCamp.status !== 'upcoming') {
      return res.status(400).json({ message: 'Registration is not available for this camp' });
    }
    
    // Increment registration count
    healthCamp.currentRegistrations += 1;
    await healthCamp.save();
    
    // In a real app, you would also save participant details
    // This is simplified for the demo
    
    res.status(201).json({ 
      message: 'Successfully registered for the health camp',
      healthCamp
    });
  } catch (error) {
    console.error('Error registering for health camp:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get upcoming health camps
// @route   GET /api/health-camps/status/upcoming
// @access  Public
router.get('/status/upcoming', async (req, res) => {
  try {
    const currentDate = new Date();
    
    const upcomingCamps = await HealthCamp.find({
      startDate: { $gt: currentDate },
      status: 'upcoming'
    }).sort({ startDate: 1 }).limit(5);
    
    res.json(upcomingCamps);
  } catch (error) {
    console.error('Error fetching upcoming health camps:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get health camps by specialty
// @route   GET /api/health-camps/specialty/:specialty
// @access  Public
router.get('/specialty/:specialty', async (req, res) => {
  try {
    const specialty = req.params.specialty;
    
    const camps = await HealthCamp.find({
      specialties: { $regex: specialty, $options: 'i' },
      status: { $in: ['upcoming', 'ongoing'] }
    }).sort({ startDate: 1 });
    
    res.json(camps);
  } catch (error) {
    console.error('Error fetching specialty health camps:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 