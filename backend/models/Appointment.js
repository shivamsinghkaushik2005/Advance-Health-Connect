import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  symptoms: {
    type: String
  },
  notes: {
    type: String
  },
  meetingLink: {
    type: String
  },
  prescription: {
    medicines: [{
      name: String,
      dosage: String,
      duration: String,
      frequency: String,
      notes: String
    }],
    diagnosis: String,
    followUpDate: Date,
    advice: String,
    issuedDate: {
      type: Date
    }
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'refunded'],
    default: 'pending'
  },
  paymentAmount: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment; 