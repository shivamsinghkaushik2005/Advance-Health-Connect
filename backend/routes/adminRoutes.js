import express from 'express';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply middleware to all routes
router.use(protect);
router.use(authorize('admin'));

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
router.get('/dashboard', async (req, res) => {
  try {
    // Get counts
    const userCount = await User.countDocuments({ userType: 'patient' });
    const doctorCount = await User.countDocuments({ userType: 'doctor' });
    const pendingDoctorCount = await Doctor.countDocuments({ isApproved: false });
    const appointmentCount = await Appointment.countDocuments();
    
    // Get recent appointments
    const recentAppointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('patientId', 'name')
      .populate('doctorId', 'name');
    
    // Get appointment stats by status
    const appointmentStats = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Format appointment stats
    const formattedAppointmentStats = {};
    appointmentStats.forEach((stat) => {
      formattedAppointmentStats[stat._id] = stat.count;
    });
    
    res.json({
      userCount,
      doctorCount,
      pendingDoctorCount,
      appointmentCount,
      recentAppointments,
      appointmentStats: formattedAppointmentStats
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ userType: { $ne: 'admin' } })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get all doctors pending approval
// @route   GET /api/admin/doctors/pending
// @access  Private (Admin only)
router.get('/doctors/pending', async (req, res) => {
  try {
    const doctors = await Doctor.find({ isApproved: false })
      .populate('userId', 'name email phoneNumber')
      .sort({ createdAt: -1 });
    
    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Approve or reject a doctor
// @route   PUT /api/admin/doctors/:id/approval
// @access  Private (Admin only)
router.put('/doctors/:id/approval', async (req, res) => {
  try {
    const { isApproved, rejectionReason } = req.body;
    
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    doctor.isApproved = isApproved;
    doctor.rejectionReason = rejectionReason || '';
    
    await doctor.save();
    
    // You can add email notification here
    
    res.json({
      message: isApproved ? 'Doctor approved successfully' : 'Doctor rejected',
      doctor
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent deleting other admins
    if (user.userType === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin users' });
    }
    
    await user.remove();
    
    // If it's a doctor, delete their doctor profile too
    if (user.userType === 'doctor') {
      await Doctor.deleteOne({ userId: user._id });
    }
    
    // Delete related appointments
    await Appointment.deleteMany({ 
      $or: [
        { patientId: user._id },
        { doctorId: user._id }
      ]
    });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 