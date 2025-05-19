import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import {
  createOrder,
  verifyPaymentSignature,
  refundPayment
} from '../utils/paymentService.js';

const router = express.Router();

// Apply middleware to all routes
router.use(protect);

// @desc    Create a payment order for an appointment
// @route   POST /api/payments/create-order
// @access  Private
router.post('/create-order', async (req, res) => {
  try {
    const { appointmentId } = req.body;
    
    if (!appointmentId) {
      return res.status(400).json({ message: 'Appointment ID is required' });
    }
    
    // Find appointment
    const appointment = await Appointment.findById(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Check if user is authorized (the patient who booked)
    if (appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Check if payment is already completed
    if (appointment.paymentStatus === 'completed') {
      return res.status(400).json({ message: 'Payment is already completed for this appointment' });
    }
    
    // Get doctor details for the amount
    const doctor = await Doctor.findById(appointment.doctorId);
    const amount = doctor.consultationFee || 500; // Default to 500 if fee not set
    
    // Create an order receipt reference
    const receipt = `appt_${appointmentId}`;
    
    // Create Razorpay order
    const order = await createOrder(amount, receipt);
    
    // Update appointment with order details
    appointment.paymentDetails = {
      orderId: order.id,
      amount: order.amount / 100, // Convert from paise to rupees
      currency: order.currency,
      receipt: order.receipt,
      createdAt: new Date()
    };
    
    await appointment.save();
    
    // Get patient details for the frontend
    const patient = await User.findById(appointment.patientId).select('name email phoneNumber');
    
    res.json({
      message: 'Payment order created successfully',
      order,
      appointment,
      patient,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    if (error.message.includes('Razorpay is not configured')) {
      return res.status(503).json({ message: 'Payment service is not available' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Verify and complete payment
// @route   POST /api/payments/verify
// @access  Private
router.post('/verify', async (req, res) => {
  try {
    const { appointmentId, paymentId, signature, orderId } = req.body;
    
    if (!appointmentId || !paymentId || !signature || !orderId) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Find appointment
    const appointment = await Appointment.findById(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Verify payment signature
    const isValidSignature = verifyPaymentSignature(orderId, paymentId, signature);
    
    if (!isValidSignature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }
    
    // Update appointment payment status
    appointment.paymentStatus = 'completed';
    appointment.paymentDetails = {
      ...appointment.paymentDetails,
      paymentId,
      completedAt: new Date()
    };
    
    await appointment.save();
    
    res.json({
      message: 'Payment verified successfully',
      appointment
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Refund a payment
// @route   POST /api/payments/refund
// @access  Private
router.post('/refund', async (req, res) => {
  try {
    const { appointmentId } = req.body;
    
    if (!appointmentId) {
      return res.status(400).json({ message: 'Appointment ID is required' });
    }
    
    // Find appointment
    const appointment = await Appointment.findById(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Check if user is authorized (the patient who booked or the doctor)
    const isPatient = appointment.patientId.toString() === req.user._id.toString();
    const isDoctor = appointment.doctorId.toString() === req.user._id.toString();
    
    if (!isPatient && !isDoctor && req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Check if payment exists and is completed
    if (!appointment.paymentDetails || !appointment.paymentDetails.paymentId || appointment.paymentStatus !== 'completed') {
      return res.status(400).json({ message: 'No completed payment found for this appointment' });
    }
    
    // Process refund
    const refund = await refundPayment(appointment.paymentDetails.paymentId);
    
    // Update appointment payment status
    appointment.paymentStatus = 'refunded';
    appointment.paymentDetails = {
      ...appointment.paymentDetails,
      refundId: refund.id,
      refundedAt: new Date()
    };
    
    await appointment.save();
    
    res.json({
      message: 'Payment refunded successfully',
      appointment,
      refund
    });
  } catch (error) {
    console.error('Refund payment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get payment history for a user
// @route   GET /api/payments/history
// @access  Private
router.get('/history', async (req, res) => {
  try {
    // Find all appointments with payment details for this user
    const query = req.user.userType === 'doctor'
      ? { doctorId: req.user._id, 'paymentDetails.paymentId': { $exists: true } }
      : { patientId: req.user._id, 'paymentDetails.paymentId': { $exists: true } };
    
    const appointments = await Appointment.find(query)
      .sort({ 'paymentDetails.completedAt': -1 })
      .populate('patientId', 'name')
      .populate('doctorId', 'name');
    
    res.json(appointments);
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;