import express from 'express';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import { sendAppointmentConfirmationEmail } from '../utils/emailService.js';

const router = express.Router();

// @desc    Get all appointments for current user (either patient or doctor)
// @route   GET /api/appointments
// @access  Private
router.get('/', async (req, res) => {
  try {
    let appointments;
    
    if (req.user.userType === 'patient') {
      // If user is a patient, get their appointments
      appointments = await Appointment.find({ patientId: req.user._id })
        .populate({
          path: 'doctorId',
          populate: {
            path: 'userId',
            select: 'name email phoneNumber gender'
          }
        })
        .sort({ appointmentDate: -1 });
    } else if (req.user.userType === 'doctor') {
      // If user is a doctor, get appointments assigned to them
      appointments = await Appointment.find({ doctorId: req.user._id })
        .populate('patientId', 'name email phoneNumber')
        .sort({ appointmentDate: -1 });
    } else {
      return res.status(403).json({ message: 'Unauthorized user type' });
    }
    
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private (Patient)
router.post('/', async (req, res) => {
  try {
    const { doctorId, appointmentDate, startTime, endTime, symptoms } = req.body;
    
    // Validate inputs
    if (!doctorId || !appointmentDate || !startTime || !endTime) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Check if slot is available
    const conflictingAppointment = await Appointment.findOne({
      doctorId,
      appointmentDate: new Date(appointmentDate),
      startTime,
      status: { $ne: 'cancelled' }
    });
    
    if (conflictingAppointment) {
      return res.status(400).json({ message: 'This slot is already booked' });
    }
    
    // Create appointment
    const appointment = await Appointment.create({
      patientId: req.user._id, // This will come from auth middleware
      doctorId,
      appointmentDate: new Date(appointmentDate),
      startTime,
      endTime,
      symptoms,
      status: 'scheduled',
      paymentStatus: 'pending',
      paymentAmount: doctor.consultationFee || 0
    });
    
    // Send email confirmation (if email service is set up)
    try {
      await sendAppointmentConfirmationEmail(req.user.email, appointment);
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
      // Continue execution even if email fails
    }
    
    res.status(201).json(appointment);
  } catch (error) {
    console.error('Appointment booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get all appointments for a patient
// @route   GET /api/appointments/patient
// @access  Private (Patient)
router.get('/patient', async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user._id })
      .populate('doctorId', 'name specialization profileImage')
      .sort({ appointmentDate: -1 });
    
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get all appointments for a doctor
// @route   GET /api/appointments/doctor
// @access  Private (Doctor)
router.get('/doctor', async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.user._id })
      .populate('patientId', 'name email phoneNumber')
      .sort({ appointmentDate: -1 });
    
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private (Doctor & Patient)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['scheduled', 'completed', 'cancelled', 'no-show'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Check authorization
    if (req.user.userType === 'patient' && appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (req.user.userType === 'doctor' && appointment.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    appointment.status = status;
    await appointment.save();
    
    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Add prescription to appointment
// @route   PUT /api/appointments/:id/prescription
// @access  Private (Doctor only)
router.put('/:id/prescription', async (req, res) => {
  try {
    const { diagnosis, medicines, followUpDate, advice } = req.body;
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Only doctors can add prescriptions
    if (req.user.userType !== 'doctor' || appointment.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    appointment.prescription = {
      diagnosis,
      medicines,
      followUpDate,
      advice,
      issuedDate: new Date()
    };
    
    appointment.status = 'completed';
    await appointment.save();
    
    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private (Patient & Doctor)
router.put('/:id/cancel', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Check authorization
    if (req.user.userType === 'patient' && appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (req.user.userType === 'doctor' && appointment.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Cannot cancel completed appointments
    if (appointment.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel completed appointments' });
    }
    
    appointment.status = 'cancelled';
    await appointment.save();
    
    res.json(appointment);
  } catch (error) {
    console.error('Error canceling appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update payment status
// @route   PUT /api/appointments/:id/payment
// @access  Private (Patient)
router.put('/:id/payment', async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    
    if (!['pending', 'completed', 'refunded'].includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Only patient can update payment
    if (appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    appointment.paymentStatus = paymentStatus;
    await appointment.save();
    
    res.json(appointment);
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 