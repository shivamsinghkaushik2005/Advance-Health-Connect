import express from 'express';
import Review from '../models/Review.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (patients only)
router.post('/', protect, async (req, res) => {
  try {
    const { doctorId, appointmentId, rating, comment } = req.body;
    
    if (!doctorId || !appointmentId || !rating) {
      return res.status(400).json({ message: 'Doctor ID, appointment ID, and rating are required' });
    }
    
    // Verify the appointment exists and belongs to this patient
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Verify the patient is the one who had the appointment
    if (appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only review your own appointments' });
    }
    
    // Verify the appointment is completed
    const now = new Date();
    const appointmentDateTime = new Date(appointment.appointmentDate);
    appointmentDateTime.setHours(
      parseInt(appointment.endTime.split(':')[0]),
      parseInt(appointment.endTime.split(':')[1])
    );
    
    if (appointmentDateTime > now) {
      return res.status(400).json({ message: 'You can only review completed appointments' });
    }
    
    // Check if review already exists for this appointment
    const existingReview = await Review.findOne({ appointmentId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this appointment' });
    }
    
    // Create the review
    const review = new Review({
      doctor: doctorId,
      patient: req.user._id,
      appointmentId,
      rating,
      comment: comment || ''
    });
    
    const savedReview = await review.save();
    
    // Update doctor's average rating
    const allReviews = await Review.find({ doctor: doctorId });
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / allReviews.length;
    
    // Update doctor document
    await Doctor.findByIdAndUpdate(doctorId, {
      rating: averageRating.toFixed(1),
      numberOfReviews: allReviews.length
    });
    
    res.status(201).json(savedReview);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Server error while creating review' });
  }
});

// @desc    Get all reviews for a doctor
// @route   GET /api/reviews/doctor/:doctorId
// @access  Public
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const reviews = await Review.find({ doctor: req.params.doctorId })
      .populate('patient', 'name')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error while fetching reviews' });
  }
});

// @desc    Get all reviews by a patient
// @route   GET /api/reviews/patient
// @access  Private
router.get('/patient', protect, async (req, res) => {
  try {
    const reviews = await Review.find({ patient: req.user._id })
      .populate('doctor', '')
      .populate({
        path: 'doctor',
        populate: {
          path: 'userId',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching patient reviews:', error);
    res.status(500).json({ message: 'Server error while fetching reviews' });
  }
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    // Find the review
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if the user is the owner of the review
    if (review.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }
    
    // Update the review
    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    
    const updatedReview = await review.save();
    
    // Update doctor's average rating
    const doctorId = review.doctor;
    const allReviews = await Review.find({ doctor: doctorId });
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / allReviews.length;
    
    // Update doctor document
    await Doctor.findByIdAndUpdate(doctorId, {
      rating: averageRating.toFixed(1),
      numberOfReviews: allReviews.length
    });
    
    res.json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Server error while updating review' });
  }
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if the user is the owner of the review
    if (review.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }
    
    const doctorId = review.doctor;
    
    await review.remove();
    
    // Update doctor's average rating
    const allReviews = await Review.find({ doctor: doctorId });
    
    if (allReviews.length > 0) {
      const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / allReviews.length;
      
      // Update doctor document
      await Doctor.findByIdAndUpdate(doctorId, {
        rating: averageRating.toFixed(1),
        numberOfReviews: allReviews.length
      });
    } else {
      // No reviews left, reset rating
      await Doctor.findByIdAndUpdate(doctorId, {
        rating: 0,
        numberOfReviews: 0
      });
    }
    
    res.json({ message: 'Review removed' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Server error while deleting review' });
  }
});

export default router;