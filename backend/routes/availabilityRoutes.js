import express from 'express';
import Doctor from '../models/Doctor.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply middleware to all routes
router.use(protect);

// @desc    Get doctor availability
// @route   GET /api/doctors/availability/:doctorId
// @access  Public
router.get('/:doctorId', async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.json({ availability: doctor.availability || [] });
  } catch (err) {
    console.error('Error fetching doctor availability:', err);
    res.status(500).json({ 
      message: 'Server error while fetching doctor availability',
      error: err.message 
    });
  }
});

// @desc    Update doctor availability
// @route   PUT /api/doctors/availability/:doctorId
// @access  Private (Doctor only)
router.put('/:doctorId', authorize('doctor'), async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const { availability } = req.body;
    
    // Validate that the doctor exists and belongs to the current user
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Ensure the doctor belongs to the current user
    if (doctor.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this doctor\'s availability' });
    }
    
    // Validate availability data
    if (!Array.isArray(availability)) {
      return res.status(400).json({ message: 'Availability must be an array' });
    }
    
    // Update the doctor's availability
    doctor.availability = availability;
    await doctor.save();
    
    res.json({ 
      message: 'Availability updated successfully',
      availability: doctor.availability 
    });
  } catch (err) {
    console.error('Error updating doctor availability:', err);
    res.status(500).json({ 
      message: 'Server error while updating doctor availability',
      error: err.message 
    });
  }
});

// @desc    Get doctor's available slots for a specific date
// @route   GET /api/doctors/availability/:doctorId/date/:date
// @access  Public
router.get('/:doctorId/date/:date', async (req, res) => {
  try {
    const { doctorId, date } = req.params;
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }
    
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Get the day of the week for the given date
    const dateObj = new Date(date);
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dateObj.getDay()];
    
    // Find the availability for this day
    const dayAvailability = doctor.availability.find(a => a.day === dayOfWeek);
    
    if (!dayAvailability) {
      return res.json({ availableSlots: [] });
    }
    
    // Return the available slots for this day
    res.json({ 
      date,
      day: dayOfWeek,
      availableSlots: dayAvailability.slots 
    });
  } catch (err) {
    console.error('Error fetching available slots:', err);
    res.status(500).json({ 
      message: 'Server error while fetching available slots',
      error: err.message 
    });
  }
});

export default router;