import express from 'express';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import { sendAppointmentConfirmationEmail } from '../utils/emailService.js';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply middleware to all routes
router.use(protect);

// @desc    Get all appointments for current user (either patient or doctor)
// @route   GET /api/appointments
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let appointments;
    const userId = req.user._id;

    console.log('Debug - Fetching appointments for user:', userId);

    // Find the user
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('Debug - User type:', user.userType);
    
    if (user.userType === 'patient') {
      // If user is a patient, get their appointments
      appointments = await Appointment.find({ patientId: userId })
        .populate({
          path: 'doctorId',
          populate: {
            path: 'userId',
            select: 'name email phoneNumber'
          }
        })
        .sort({ appointmentDate: -1 });
    } else if (user.userType === 'doctor') {
      // First find the doctor profile
      console.log('Debug - Finding doctor profile for userId:', userId);
      const doctorProfile = await Doctor.findOne({ userId: userId });
      if (!doctorProfile) {
        console.log('Debug - Doctor profile not found');
        return res.status(404).json({ message: 'Doctor profile not found' });
      }
      console.log('Debug - Found doctor profile:', doctorProfile._id);

      // If user is a doctor, get appointments assigned to them
      appointments = await Appointment.find({ doctorId: doctorProfile._id })
        .populate({
          path: 'patientId',
          model: User,
          select: 'name email phoneNumber'
        })
        .sort({ appointmentDate: -1 });

      console.log('Debug - Found appointments:', appointments.length);

      // Add additional patient information if needed
      appointments = appointments.map(appointment => {
        const appointmentObj = appointment.toObject();
        
        // Add formatted date and time
        appointmentObj.formattedDate = new Date(appointment.appointmentDate).toLocaleDateString();
        appointmentObj.formattedTime = `${appointment.startTime} - ${appointment.endTime}`;
        
        // Add patient details
        if (appointmentObj.patientId) {
          appointmentObj.patientName = appointmentObj.patientId.name;
          appointmentObj.patientEmail = appointmentObj.patientId.email;
          appointmentObj.patientPhone = appointmentObj.patientId.phoneNumber;
        }
        
        return appointmentObj;
      });
    } else {
      return res.status(403).json({ message: 'Unauthorized user type' });
    }
    
    console.log('Debug - Sending appointments response:', appointments.length);
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ 
      message: 'Server error while fetching appointments',
      error: err.message 
    });
  }
});

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private (Patient)
router.post('/', auth, async (req, res) => {
  try {
    const { doctorId, appointmentDate, startTime, endTime, symptoms, notes } = req.body;
    
    // Validate inputs
    if (!doctorId || !appointmentDate || !startTime || !endTime || !symptoms) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Get user from auth middleware
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    // Double check user exists and is a patient
    const verifiedUser = await User.findById(user._id).select('-password');
    if (!verifiedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (verifiedUser.userType !== 'patient') {
      return res.status(403).json({ message: 'Only patients can book appointments' });
    }
    
    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId).populate('userId', 'name email');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Check if slot is available
    const appointmentDateObj = new Date(appointmentDate);
    const conflictingAppointment = await Appointment.findOne({
      doctorId,
      appointmentDate: appointmentDateObj,
      startTime,
      status: { $ne: 'cancelled' }
    });
    
    if (conflictingAppointment) {
      return res.status(400).json({ message: 'This slot is already booked' });
    }
    
    // Create appointment
    const appointment = new Appointment({
      patientId: verifiedUser._id,
      doctorId,
      appointmentDate: appointmentDateObj,
      startTime,
      endTime,
      symptoms,
      notes,
      status: 'scheduled',
      paymentStatus: 'pending',
      paymentAmount: doctor.fees || 0
    });

    await appointment.save();

    // Populate the appointment with doctor and patient details
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctorId', 'speciality fees')
      .populate('patientId', 'name email phoneNumber');
    
    // Send email confirmation (if email service is set up)
    try {
      await sendAppointmentConfirmationEmail(verifiedUser.email, populatedAppointment);
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
      // Continue execution even if email fails
    }
    
    res.status(201).json(populatedAppointment);
  } catch (error) {
    console.error('Appointment booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get all appointments for a patient
// @route   GET /api/appointments/patient
// @access  Private (Patient)
router.get('/patient', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user._id })
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email phoneNumber'
        }
      })
      .sort({ appointmentDate: -1 });
    
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get all appointments for a doctor with patient details
// @route   GET /api/appointments/doctor/:doctorId
// @access  Private
router.get('/doctor/:doctorId', auth, async (req, res) => {
  try {
    console.log('Debug - Fetching appointments for doctor ID:', req.params.doctorId);
    
    // Validate the doctor ID
    const doctor = await Doctor.findById(req.params.doctorId);
    if (!doctor) {
      console.log('Debug - Doctor not found for ID:', req.params.doctorId);
      return res.status(404).json({ message: 'Doctor not found' });
    }
    console.log('Debug - Found doctor:', doctor);

    // Get all appointments for this doctor
    const appointments = await Appointment.find({ 
      doctorId: req.params.doctorId
    })
    .populate({
      path: 'patientId',
      select: 'name email phoneNumber',
      model: User
    })
    .sort({ appointmentDate: -1 });

    console.log('Debug - Found appointments:', appointments.length);

    // Add formatted date and time to each appointment
    const formattedAppointments = appointments.map(appointment => {
      const appointmentObj = appointment.toObject();
      appointmentObj.formattedDate = new Date(appointment.appointmentDate).toLocaleDateString();
      appointmentObj.formattedTime = `${appointment.startTime} - ${appointment.endTime}`;
      return appointmentObj;
    });

    console.log('Debug - Sending formatted appointments');
    res.json(formattedAppointments);
  } catch (err) {
    console.error('Debug - Error in /doctor/:doctorId route:', {
      error: err.message,
      stack: err.stack,
      doctorId: req.params.doctorId
    });
    res.status(500).json({ 
      message: 'Server error while fetching appointments',
      error: err.message 
    });
  }
});

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (status && !['scheduled', 'completed', 'cancelled', 'no-show'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Check authorization
    if (req.user.userType === 'patient' && appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this appointment' });
    }
    
    if (req.user.userType === 'doctor' && appointment.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this appointment' });
    }
    
    // Update fields
    if (status) appointment.status = status;
    
    const updatedAppointment = await appointment.save();
    
    // Populate patient and doctor details before sending response
    const populatedAppointment = await Appointment.findById(updatedAppointment._id)
      .populate({
        path: 'patientId',
        model: User,
        select: 'name email phoneNumber'
      });
    
    // Add formatted date and time
    const appointmentData = populatedAppointment.toObject();
    appointmentData.formattedDate = new Date(populatedAppointment.appointmentDate).toLocaleDateString();
    appointmentData.formattedTime = `${populatedAppointment.startTime} - ${populatedAppointment.endTime}`;
    
    res.json(appointmentData);
  } catch (err) {
    console.error('Error updating appointment:', err);
    res.status(500).json({ 
      message: 'Server error while updating appointment',
      error: err.message 
    });
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